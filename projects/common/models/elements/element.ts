// eslint-disable-next-line max-classes-per-file
import { Type } from '@angular/core';
import { VariableInfo } from '@iqb/responses';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  DimensionProperties, PlayerProperties, PositionProperties, PropertyGroupGenerators, Stylings
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService,
  InputAssistancePreset, InputElementProperties, InputElementValue,
  KeyInputElementProperties, PlayerElementBlueprint, TextInputElementProperties,
  UIElementProperties, UIElementType, UIElementValue
} from 'common/interfaces';
import { IDError, InstantiationEror } from 'common/errors';

function isUIElementProperties(blueprint: Partial<UIElementProperties>): blueprint is UIElementProperties {
  return blueprint.id !== undefined &&
    blueprint.isRelevantForPresentationComplete !== undefined;
}

export abstract class UIElement implements UIElementProperties {
  [index: string]: unknown;
  id: string;
  alias: string;
  isRelevantForPresentationComplete: boolean = true;
  abstract type: UIElementType;
  position?: PositionProperties;
  dimensions?: DimensionProperties;
  styling?: Stylings;
  player?: PlayerProperties;
  idService?: AbstractIDService;

  constructor(element: { type: UIElementType } & Partial<UIElementProperties>, idService?: AbstractIDService) {
    this.idService = idService;
    if (isUIElementProperties(element)) {
      this.id = element.id;
      this.alias = element.alias || element.id;
      if (idService) {
        // Only register after the child constructior has run. ID-registration needs the type and possibly values.
        setTimeout(() => this.registerIDs());
      }
      this.isRelevantForPresentationComplete = element.isRelevantForPresentationComplete;
      if (element.dimensions) this.dimensions = { ...element.dimensions };
      if (element.position) this.position = { ...element.position };
      if (element.styling) this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at UIElement instantiation', element);
      }
      this.id = element.id ??
        idService?.getAndRegisterNewID(element.type) ??
        (() => { throw new Error(`No ID or IDService given: ${this.type}`); })();
      this.alias = element.alias ??
        idService?.getAndRegisterNewID(element.type, true) ??
        (() => { throw new Error(`No Alias or IDService given: ${this.type}`); })();
      if (element?.isRelevantForPresentationComplete !== undefined) {
        this.isRelevantForPresentationComplete = element.isRelevantForPresentationComplete;
      }
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element?.dimensions);
    }
  }

  setProperty(property: string, value: unknown): void {
    if (Array.isArray(this[property])) { // keep array reference intact
      (this[property] as UIElementValue[])
        .splice(0, (this[property] as UIElementValue[]).length, ...(value as UIElementValue[]));
      return;
    }
    if (property === 'alias') {
      if (!this.idService) throw new Error('IDService not available');
      if (!this.idService.isAliasAvailable(value as string, this.type)) { // prohibit existing IDs
        throw new IDError('ID ist bereits vergeben');
      }
      if ((value as string).length > 20) {
        throw new IDError('ID länger als 20 Zeichen');
      }
      if ((value as string).includes(' ')) {
        throw new IDError('ID enthält unerlaubtes Leerzeichen');
      }
      this.idService.unregister(this.alias, this.type, false, true);
      this.idService.register(value as string, this.type, false, true);
    }
    this[property] = value;
  }

  setStyleProperty(property: string, value: UIElementValue): void {
    (this.styling as Stylings)[property] = value;
  }

  setPositionProperty(property: string, value: UIElementValue): void {
    (this.position as PositionProperties)[property] = value;
  }

  setDimensionsProperty(property: string, value: number | null): void {
    (this.dimensions as DimensionProperties)[property] = value;
  }

  setPlayerProperty(property: string, value: UIElementValue): void {
    (this.player as PlayerProperties)[property] = value;
  }

  // eslint-disable-next-line class-methods-use-this
  getChildElements(): UIElement[] {
    return [];
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  getVariableInfos(options?: unknown): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'no-value',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }

  getIdentifiers(): { id: string, alias: string }[] {
    return [{ id: this.id, alias: this.alias }];
  }

  abstract getElementComponent(): Type<ElementComponent>;

  static createOptionLabel(optionText: string, addImg: boolean = false) {
    return {
      text: optionText,
      imgSrc: addImg ? null : undefined,
      imgPosition: addImg ? 'above' : undefined
    };
  }

  /* ID and alias are removed, so they can be re-assigned by the element constructor. */
  getBlueprint(): UIElementProperties {
    return { ...this, id: undefined, alias: undefined };
  }

  registerIDs(): void {
    if (!this.idService) throw new Error(`IDService not available: ${this.type} ${this.id}`);
    this.idService.register(this.id, this.type, true, false);
    this.idService.register(this.alias, this.type, false, true);
  }

  unregisterIDs(): void {
    if (!this.idService) throw new Error(`IDService not available: ${this.type} ${this.id}`);
    this.idService.unregister(this.id, this.type, true, false);
    this.idService.unregister(this.alias, this.type, false, true);
  }
}

function isInputElementProperties(blueprint: Partial<InputElementProperties>): blueprint is InputElementProperties {
  if (!blueprint) return false;
  return blueprint?.value !== undefined &&
    blueprint?.required !== undefined &&
    blueprint?.requiredWarnMessage !== undefined &&
    blueprint?.readOnly !== undefined;
}

export abstract class InputElement extends UIElement implements InputElementProperties {
  label?: string = '';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(element: { type: string } & Partial<InputElementProperties>, idService?: AbstractIDService) {
    super(element, idService);
    if (isInputElementProperties(element)) {
      if (element.label !== undefined) this.label = element.label;
      this.value = element.value;
      this.required = element.required;
      this.requiredWarnMessage = element.requiredWarnMessage;
      this.readOnly = element.readOnly;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at InputElement instantiation', element);
      }
      if (element?.label !== undefined) this.label = element.label;
      if (element?.value !== undefined) this.value = element.value;
      if (element?.required !== undefined) this.required = element.required;
      if (element?.requiredWarnMessage !== undefined) this.requiredWarnMessage = element.requiredWarnMessage;
      if (element?.readOnly !== undefined) this.readOnly = element.readOnly;
    }
  }

  static stripHTML(htmlString: string): string {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlString, 'text/html');
    return htmlDocument.documentElement.textContent || '';
  }
}

export function isInputElement(el: UIElement): el is InputElement {
  return el.value !== undefined &&
    el.required !== undefined &&
    el.requiredWarnMessage !== undefined &&
    el.readOnly !== undefined;
}

function isValidKeyInputProperties(blueprint: Partial<KeyInputElementProperties>): boolean {
  return blueprint.inputAssistancePreset !== undefined &&
    blueprint.inputAssistancePosition !== undefined &&
    blueprint.inputAssistanceFloatingStartPosition !== undefined &&
    blueprint.showSoftwareKeyboard !== undefined &&
    blueprint.addInputAssistanceToKeyboard !== undefined &&
    blueprint.hideNativeKeyboard !== undefined &&
    blueprint.hasArrowKeys !== undefined;
}

function isTextInputElementProperties(blueprint: Partial<TextInputElementProperties>)
  : blueprint is TextInputElementProperties {
  return blueprint.restrictedToInputAssistanceChars !== undefined &&
    blueprint.inputAssistanceCustomKeys !== undefined &&
    blueprint.hasBackspaceKey !== undefined &&
    isValidKeyInputProperties(blueprint);
}

export abstract class TextInputElement extends InputElement implements TextInputElementProperties {
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistanceCustomKeys: string = '';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter' = 'startBottom';
  restrictedToInputAssistanceChars: boolean = false;
  hasArrowKeys: boolean = false;
  hasBackspaceKey: boolean = false;
  showSoftwareKeyboard: boolean = true;
  addInputAssistanceToKeyboard: boolean = true;
  hideNativeKeyboard: boolean = true;

  protected constructor(element: { type: string } & Partial<TextInputElementProperties>, idService?: AbstractIDService) {
    super(element, idService);
    if (isTextInputElementProperties(element)) {
      this.inputAssistancePreset = element.inputAssistancePreset;
      this.inputAssistanceCustomKeys = element.inputAssistanceCustomKeys;
      this.inputAssistancePosition = element.inputAssistancePosition;
      this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
      this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
      this.hasArrowKeys = element.hasArrowKeys;
      this.hasBackspaceKey = element.hasBackspaceKey;
      this.showSoftwareKeyboard = element.showSoftwareKeyboard;
      this.hideNativeKeyboard = element.hideNativeKeyboard;
      this.addInputAssistanceToKeyboard = element.addInputAssistanceToKeyboard;
    } else {
      if (environment.strictInstantiation) {
        throw Error('Error at TextInputElement instantiation');
      }
      if (element?.inputAssistancePreset) this.inputAssistancePreset = element.inputAssistancePreset;
      if (element?.inputAssistanceCustomKeys) this.inputAssistanceCustomKeys = element.inputAssistanceCustomKeys;
      if (element?.inputAssistancePosition) this.inputAssistancePosition = element.inputAssistancePosition;
      if (element?.inputAssistanceFloatingStartPosition) this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
      if (element?.restrictedToInputAssistanceChars) this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
      if (element?.hasArrowKeys) this.hasArrowKeys = element.hasArrowKeys;
      if (element?.hasBackspaceKey) this.hasBackspaceKey = element.hasBackspaceKey;
      if (element?.showSoftwareKeyboard) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
      if (element?.addInputAssistanceToKeyboard) this.addInputAssistanceToKeyboard = element.addInputAssistanceToKeyboard;
      if (element?.hideNativeKeyboard) this.hideNativeKeyboard = element.hideNativeKeyboard;
    }
  }
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];

  abstract getBlueprint(): UIElementProperties;
}

function isPlayerElementBlueprint(blueprint: Partial<PlayerElementBlueprint>): blueprint is PlayerElementBlueprint {
  if (!blueprint) return false;
  return blueprint.player !== undefined &&
    blueprint.player.autostart !== undefined &&
    blueprint.player.autostartDelay !== undefined &&
    blueprint.player.loop !== undefined &&
    blueprint.player.startControl !== undefined &&
    blueprint.player.pauseControl !== undefined &&
    blueprint.player.progressBar !== undefined &&
    blueprint.player.interactiveProgressbar !== undefined &&
    blueprint.player.volumeControl !== undefined &&
    blueprint.player.defaultVolume !== undefined &&
    blueprint.player.minVolume !== undefined &&
    blueprint.player.muteControl !== undefined &&
    blueprint.player.interactiveMuteControl !== undefined &&
    blueprint.player.hintLabel !== undefined &&
    blueprint.player.hintLabelDelay !== undefined &&
    blueprint.player.activeAfterID !== undefined &&
    blueprint.player.minRuns !== undefined &&
    blueprint.player.maxRuns !== undefined &&
    blueprint.player.showRestRuns !== undefined &&
    blueprint.player.showRestTime !== undefined &&
    blueprint.player.playbackTime !== undefined;
}

export abstract class PlayerElement extends UIElement implements PlayerElementBlueprint {
  player: PlayerProperties;

  protected constructor(element: { type: string } & Partial<PlayerElementBlueprint>, idService?: AbstractIDService) {
    super(element, idService);
    if (isPlayerElementBlueprint(element)) {
      this.player = element.player;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at PlayerElement instantiation', element);
      }
      this.player = PropertyGroupGenerators.generatePlayerProps(element?.player);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'number',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }
}
