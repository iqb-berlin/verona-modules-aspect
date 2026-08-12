// eslint-disable-next-line max-classes-per-file
import { VariableInfo } from '@iqb/responses';
import {
  DimensionProperties, PlayerProperties, PositionProperties,
  PropertyGroupGenerators, Stylings
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  InputAssistancePreset,
  InputElementProperties,
  InputElementValue,
  TextInputElementProperties
} from 'common/models/input-element-interfaces';
import {
  PlayerElementBlueprint,
  UIElementProperties,
  UIElementType,
  UIElementValue
} from 'common/models/ui-element-interfaces';
import { IDError } from 'common/classes/id-error';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';
import { VariableAlias } from 'common/utils/variable-alias';

type RevisionAwareIDService = AbstractIDService & { getResetRevision?: () => number };

function getResetRevision(idService?: AbstractIDService): number | null {
  const revisionReader = (idService as RevisionAwareIDService | undefined)?.getResetRevision;
  return typeof revisionReader === 'function' ? revisionReader.call(idService) : null;
}

export function isUIElementProperties(blueprint: Partial<UIElementProperties>): blueprint is UIElementProperties {
  return blueprint !== undefined && blueprint !== null;
}

export abstract class UIElement implements UIElementProperties {
  [index: string]: unknown;
  id!: string;
  alias!: string;
  isRelevantForPresentationComplete: boolean = true;
  abstract type: UIElementType;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(GLOBAL_DEFAULTS);
  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(GLOBAL_DEFAULTS);
  styling: Stylings = PropertyGroupGenerators.generateBasicStyleProps(GLOBAL_DEFAULTS);
  player?: PlayerProperties;
  idService?: AbstractIDService;

  constructor(element: { type: UIElementType } & Partial<UIElementProperties>, idService?: AbstractIDService) {
    this.idService = idService;

    if (isUIElementProperties(element)) {
      this.id = element.id ??
        idService?.getAndRegisterNewID(element.type) ??
        (() => { throw new Error(`No ID or IDService given: ${element.type}`); })();
      this.alias = element.alias ??
        (element.id ? element.id : idService?.getAndRegisterNewID(element.type, true)) ??
        (() => { throw new Error(`No Alias or IDService given: ${element.type}`); })();

      if (idService && !element.id) {
        const loadRevision = getResetRevision(idService);
        setTimeout(() => {
          const currentRevision = getResetRevision(this.idService);
          if (loadRevision !== null && currentRevision !== loadRevision) {
            return;
          }
          this.registerIDs();
        });
      }
      if (element.isRelevantForPresentationComplete !== undefined) {
        this.isRelevantForPresentationComplete = element.isRelevantForPresentationComplete;
      }
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.position = { ...this.position, ...element.position };
      this.styling = { ...this.styling, ...element.styling };
      if (element.player) this.player = { ...element.player };
    } else {
      if (environment.strictInstantiation && element.isRelevantForPresentationComplete !== undefined) {
        throw new InstantiationEror('Error at UIElement instantiation', element);
      }
      this.id = element.id ??
        idService?.getAndRegisterNewID(element.type) ?? 'id_placeholder';
      this.alias = element.alias ??
        (element.id ? element.id : idService?.getAndRegisterNewID(element.type, true)) ?? 'alias_placeholder';
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
      if (!this.idService.isAliasAvailable(value as string)) {
        throw new IDError('ID ist bereits vergeben');
      }
      if ((value as string).includes(' ')) {
        throw new IDError('ID enthält unerlaubtes Leerzeichen');
      }
      if (!VariableAlias.isValid(value as string)) {
        throw new IDError('ID enthält unerlaubte Zeichen (erlaubt: a-z, A-Z, 0-9, _, -)');
      }
      this.idService.unregister(this.alias, false, true);
      this.idService.register(value as string, false, true);
    }
    this[property] = value;
  }

  setStyleProperty(property: keyof Stylings, value: UIElementValue): void {
    Object.assign(this.styling, { [property]: value });
  }

  /*
   * The property name is checked against the interface, the value is not. Narrowing the value per
   * property would mean a generic threaded through the whole panel relay chain, where values arrive
   * as UIElementValue from the templates; Object.assign is what lets the name stay checked without
   * it. The name is the half that matters: a rename in the model now breaks every call site
   * (#1137).
   */
  setPositionProperty(property: keyof PositionProperties, value: UIElementValue): void {
    Object.assign(this.position, { [property]: value });
  }

  // boolean is in here for isWidthFixed / isHeightFixed, which DimensionProperties declares as
  // booleans; the panel has always written them through this method.
  setDimensionsProperty(property: keyof DimensionProperties, value: number | boolean | null): void {
    Object.assign(this.dimensions, { [property]: value });
  }

  setPlayerProperty(property: keyof PlayerProperties, value: UIElementValue): void {
    Object.assign(this.player as PlayerProperties, { [property]: value });
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

  static createOptionLabel(optionText: string, addImg: boolean = false) {
    return {
      text: optionText,
      imgSrc: addImg ? null : undefined,
      imgPosition: addImg ? 'above' : undefined
    };
  }

  /**
   * The element as plain data, for creating another one from it - duplicating an element, duplicating
   * a section, inserting a copy.
   *
   * ID and alias are removed, so the constructor can assign new ones. Everything else is **deep
   * copied**: this used to be `{ ...this }`, and a shallow copy left original and duplicate on the
   * same nested values. Editing the copy's option list then changed the original's, because
   * `setProperty` splices into arrays in place - measured for every element type in #1179, and the
   * same for `EditorSection.getDuplicate()`, which builds on this method.
   *
   * `idService` is left out: the constructor takes it as its own argument and never reads it off the
   * blueprint. It also has no place in plain data - `copySectionToClipboard` strips it again on the
   * way out.
   */
  getBlueprint(): UIElementProperties {
    const blueprint: Record<string, unknown> = {};
    Object.entries(this as unknown as Record<string, unknown>).forEach(([key, value]) => {
      if (key === 'idService') return;
      blueprint[key] = cloneForBlueprint(value);
    });
    return { ...blueprint, id: undefined, alias: undefined } as unknown as UIElementProperties;
  }

  registerIDs(): void {
    if (!this.idService) throw new Error(`IDService not available: ${this.type} ${this.id}`);
    this.idService.register(this.id, true, false);
    this.idService.register(this.alias, false, true);
  }

  unregisterIDs(): void {
    if (!this.idService) throw new Error(`IDService not available: ${this.type} ${this.id}`);
    this.idService.unregister(this.id, true, false);
    this.idService.unregister(this.alias, false, true);
  }
}

export function isInputElementProperties(blueprint: Partial<InputElementProperties>)
  : blueprint is InputElementProperties {
  return blueprint !== undefined && blueprint !== null;
}

export abstract class InputElement extends UIElement implements InputElementProperties {
  label?: string = '';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(
    element: { type: string } & Partial<InputElementProperties>,
    idService?: AbstractIDService
  ) {
    super(element, idService);
    if (isInputElementProperties(element)) {
      if (element.label !== undefined) this.label = element.label;
      if (element.value !== undefined) this.value = element.value;
      if (element.required !== undefined) this.required = element.required;
      if (element.requiredWarnMessage !== undefined) this.requiredWarnMessage = element.requiredWarnMessage;
      if (element.readOnly !== undefined) this.readOnly = element.readOnly;
    } else if (environment.strictInstantiation && element.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at InputElement instantiation', element);
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

function isTextInputElementProperties(blueprint: Partial<TextInputElementProperties>):
  blueprint is TextInputElementProperties {
  return blueprint !== undefined && blueprint !== null;
}

export abstract class TextInputElement extends InputElement implements TextInputElementProperties {
  inputAssistancePreset: InputAssistancePreset = null;
  inputAssistanceCustomKeys: string = '';
  inputAssistanceCustomStyle: 'small' | 'medium' | 'large' = 'medium';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter' = 'startBottom';
  restrictedToInputAssistanceChars: boolean = false;
  hasArrowKeys: boolean = false;
  hasBackspaceKey: boolean = false;
  showSoftwareKeyboard: boolean = false;
  addInputAssistanceToKeyboard: boolean = false;
  hideNativeKeyboard: boolean = false;
  keyStyle: 'round' | 'square' = 'round';

  protected constructor(
    element: { type: string } & Partial<TextInputElementProperties>,
    idService?: AbstractIDService
  ) {
    super(element, idService);
    if (isTextInputElementProperties(element)) {
      if (element.inputAssistancePreset !== undefined) this.inputAssistancePreset = element.inputAssistancePreset;
      if (element.inputAssistanceCustomKeys !== undefined) {
        this.inputAssistanceCustomKeys = element.inputAssistanceCustomKeys;
      }
      if (element.inputAssistanceCustomStyle !== undefined) {
        this.inputAssistanceCustomStyle = element.inputAssistanceCustomStyle;
      }
      if (element.inputAssistancePosition !== undefined) this.inputAssistancePosition = element.inputAssistancePosition;
      if (element.inputAssistanceFloatingStartPosition !== undefined) {
        this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
      }
      if (element.restrictedToInputAssistanceChars !== undefined) {
        this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
      }
      if (element.hasArrowKeys !== undefined) this.hasArrowKeys = element.hasArrowKeys;
      if (element.hasBackspaceKey !== undefined) this.hasBackspaceKey = element.hasBackspaceKey;
      if (element.showSoftwareKeyboard !== undefined) this.showSoftwareKeyboard = element.showSoftwareKeyboard;
      if (element.hideNativeKeyboard !== undefined) this.hideNativeKeyboard = element.hideNativeKeyboard;
      if (element.addInputAssistanceToKeyboard !== undefined) {
        this.addInputAssistanceToKeyboard = element.addInputAssistanceToKeyboard;
      }
      if (element.keyStyle !== undefined) this.keyStyle = element.keyStyle;
    } else if (environment.strictInstantiation) {
      throw Error('Error at TextInputElement instantiation');
    }
  }
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];

  /* `getBlueprint()` used to be abstract here, so that every compound element had to turn its
     children into blueprints itself. Since #1179 the base class does that for any nested element it
     finds, so the requirement only invited copies that also had to remember the deep copy. Subclasses
     still override it where the return type matters or where ids inside values have to go. */
}

function isPlayerElementBlueprint(blueprint: Partial<PlayerElementBlueprint>): blueprint is PlayerElementBlueprint {
  if (!blueprint) return false;
  return blueprint.player !== undefined &&
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
    blueprint.player.showHint !== undefined &&
    blueprint.player.hintLabel !== undefined &&
    blueprint.player.hintDelay !== undefined &&
    blueprint.player.activeAfterID !== undefined &&
    blueprint.player.minRuns !== undefined &&
    blueprint.player.maxRuns !== undefined &&
    blueprint.player.showRestRuns !== undefined &&
    blueprint.player.showRestTime !== undefined &&
    blueprint.player.playbackTime !== undefined &&
    blueprint.player.imgSrc !== undefined &&
    blueprint.player.imgFileName !== undefined;
}

export abstract class PlayerElement extends UIElement implements PlayerElementBlueprint {
  player!: PlayerProperties;

  protected constructor(element: { type: string } & Partial<PlayerElementBlueprint>, idService?: AbstractIDService) {
    super(element, idService);
    if (isPlayerElementBlueprint(element)) {
      this.player = { ...element.player };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at PlayerElement instantiation', element);
      }
      this.player = PropertyGroupGenerators.generatePlayerProps(element.player);
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

/**
 * Deep copy for {@link UIElement.getBlueprint}.
 *
 * Child elements are turned into blueprints of their own rather than cloned as objects: they are
 * class instances, a blueprint is plain data, and their own `getBlueprint()` knows what else has to
 * be dropped - the drop list clears the ids of its values, the cloze those of its child models.
 *
 * `idService` is skipped wherever it appears, including on child elements: it is a service, not data,
 * and `structuredClone` would refuse it depending on how its methods are declared.
 */
function cloneForBlueprint<T>(value: T): T {
  if (Array.isArray(value)) return value.map(entry => cloneForBlueprint(entry)) as unknown as T;
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof UIElement) return value.getBlueprint() as unknown as T;
  const clone: Record<string, unknown> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (key === 'idService') return;
    clone[key] = cloneForBlueprint(entry);
  });
  return clone as T;
}
