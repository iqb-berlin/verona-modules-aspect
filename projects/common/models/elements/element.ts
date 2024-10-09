// eslint-disable-next-line max-classes-per-file
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

import { Label, TextLabel } from 'common/models/elements/label-interfaces';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import {
  DimensionProperties,
  PlayerProperties,
  PositionProperties,
  PropertyGroupGenerators,
  PropertyGroupValidators,
  Stylings
} from 'common/models/elements/property-group-interfaces';
import { VisibilityRule } from 'common/models/visibility-rule';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

import { MathTableRow } from 'common/models/elements/input-elements/math-table';
import { VariableInfo } from '@iqb/responses';
import { Markable } from 'player/src/app/models/markable.interface';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images' | 'hotspot-image'
| 'drop-list' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button' | 'geometry'
| 'math-field' | 'math-table' | 'text-area-math' | 'trigger' | 'table';

export interface OptionElement extends UIElement {
  getNewOptionLabel(optionText: string): Label;
}

export interface Measurement {
  value: number;
  unit: string
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] | StateVariable |
PositionProperties | PlayerProperties | Measurement | Measurement[] | VisibilityRule[];

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue' | 'space' | 'comma' | 'custom';

export interface UIElementProperties {
  id: string;
  isRelevantForPresentationComplete: boolean;
  dimensions?: DimensionProperties;
  position?: PositionProperties;
  styling?: Stylings;
  player?: PlayerProperties;
}

function isValidUIElementProperties(blueprint?: UIElementProperties): boolean {
  if (!blueprint) return false;
  return blueprint.id !== undefined &&
    blueprint.isRelevantForPresentationComplete !== undefined;
}

export abstract class UIElement implements UIElementProperties {
  [index: string]: unknown;
  id: string = 'id-placeholder';
  isRelevantForPresentationComplete: boolean = true;
  abstract type: UIElementType;
  position?: PositionProperties;
  dimensions?: DimensionProperties;
  styling?: Stylings;
  player?: PlayerProperties;

  constructor(element?: UIElementProperties) {
    if (element && isValidUIElementProperties(element)) {
      this.id = element.id;
      this.isRelevantForPresentationComplete = element.isRelevantForPresentationComplete;
      if (element.dimensions) this.dimensions = { ...element.dimensions };
      if (element.position) this.position = { ...element.position };
      if (element.styling) this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at UIElement instantiation', element);
      }
      if (element?.id) this.id = element.id;
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
    } else {
      this[property] = value;
    }
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
    return [];
  }

  abstract getElementComponent(): Type<ElementComponent>;

  static createOptionLabel(optionText: string, addImg: boolean = false) {
    return {
      text: optionText,
      imgSrc: addImg ? null : undefined,
      imgPosition: addImg ? 'above' : undefined
    };
  }

  abstract getDuplicate(): UIElement;
}

export type InputElementValue = Markable[] | TextLabel[] | Hotspot[] | MathTableRow[] | GeometryValue | string[] | string |
number[] | number | boolean[] | boolean | null;

export interface InputElementProperties extends UIElementProperties {
  label?: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;
}

function isValidInputElementProperties(blueprint?: InputElementProperties): boolean {
  if (!blueprint) return false;
  return blueprint?.value !== undefined &&
    blueprint?.required !== undefined &&
    blueprint?.requiredWarnMessage !== undefined &&
    blueprint?.readOnly !== undefined;
}

export abstract class InputElement extends UIElement implements InputElementProperties {
  label?: string = 'Beschriftung';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(element?: InputElementProperties) {
    super(element);
    if (element && isValidInputElementProperties(element)) {
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

export interface KeyInputElementProperties {
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter';
  showSoftwareKeyboard: boolean;
  addInputAssistanceToKeyboard: boolean;
  hideNativeKeyboard: boolean;
  hasArrowKeys: boolean;
}

export interface TextInputElementProperties extends KeyInputElementProperties, InputElementProperties {
  inputAssistanceCustomKeys: string;
  restrictedToInputAssistanceChars: boolean;
  hasBackspaceKey: boolean;
}

function isValidKeyInputProperties(blueprint?: KeyInputElementProperties): boolean {
  if (!blueprint) return false;
  return blueprint.inputAssistancePreset !== undefined &&
    blueprint.inputAssistancePosition !== undefined &&
    blueprint.inputAssistanceFloatingStartPosition !== undefined &&
    blueprint.showSoftwareKeyboard !== undefined &&
    blueprint.addInputAssistanceToKeyboard !== undefined &&
    blueprint.hideNativeKeyboard !== undefined &&
    blueprint.hasArrowKeys !== undefined;
}

function isValidTextInputElementProperties(blueprint?: TextInputElementProperties): boolean {
  if (!blueprint) return false;
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

  protected constructor(element?: TextInputElementProperties) {
    super(element);
    if (element && isValidTextInputElementProperties(element)) {
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
}

export interface PlayerElementBlueprint extends UIElementProperties {
  player: PlayerProperties;
}

function isValidPlayerElementBlueprint(blueprint?: PlayerElementBlueprint): boolean {
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

  protected constructor(element?: PlayerElementBlueprint) {
    super(element);
    if (element && isValidPlayerElementBlueprint(element)) {
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

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
  dimensions: DimensionProperties;
}

export interface PlayerElement extends UIElement {
  player: PlayerProperties;
}

export type TooltipPosition = 'left' | 'right' | 'above' | 'below';

export interface GeometryValue {
  appDefinition: string;
  variables: GeometryVariable[];
}

export interface GeometryVariable {
  id: string;
  value: string;
}
