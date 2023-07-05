// eslint-disable-next-line max-classes-per-file
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { Label, TextLabel } from 'common/models/elements/label-interfaces';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import {
  DimensionProperties, PlayerProperties, PositionProperties, Stylings
} from 'common/models/elements/property-group-interfaces';
import { VisibilityRule } from 'common/models/visibility-rule';
import { StateVariable } from 'common/models/state-variable';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images' | 'hotspot-image'
| 'drop-list' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button' | 'geometry'
| 'math-field';

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
  dimensions: DimensionProperties;
  position?: PositionProperties;
  styling?: Stylings;
  player?: PlayerProperties;
}

export abstract class UIElement implements UIElementProperties {
  [index: string]: unknown;
  id: string;
  abstract type: UIElementType;
  position?: PositionProperties;
  dimensions: DimensionProperties;
  styling?: Stylings;
  player?: PlayerProperties;
  isRelevantForPresentationComplete?: boolean;

  constructor(element: UIElementProperties) {
    this.id = element.id;
    this.dimensions = element.dimensions;
    this.position = element.position;
    this.styling = element.styling;
  }

  setProperty(property: string, value: UIElementValue): void {
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
    this.dimensions[property] = value;
  }

  setPlayerProperty(property: string, value: UIElementValue): void {
    (this.player as PlayerProperties)[property] = value;
  }

  // eslint-disable-next-line class-methods-use-this
  getChildElements(): UIElement[] {
    return [];
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerSchemeValues);
  }

  abstract getElementComponent(): Type<ElementComponent>;

  static createOptionLabel(optionText: string, addImg: boolean = false) {
    return {
      text: optionText,
      imgSrc: addImg ? null : undefined,
      imgPosition: addImg ? 'above' : undefined
    };
  }
}

export type InputElementValue = string[] | string | number | boolean | TextLabel[] | null | Hotspot[] | boolean[];

export interface InputElementProperties extends UIElementProperties {
  label: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;
}

export abstract class InputElement extends UIElement implements InputElementProperties {
  label: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;

  protected constructor(element: InputElementProperties) {
    super(element);
    this.label = element.label;
    this.value = element.value;
    this.required = element.required;
    this.requiredWarnMessage = element.requiredWarnMessage;
    this.readOnly = element.readOnly;
  }

  abstract getAnswerScheme(options?: unknown): AnswerScheme;

  static stripHTML(htmlString: string): string {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlString, 'text/html');
    return htmlDocument.documentElement.textContent || '';
  }
}

export interface TextInputElementProperties extends InputElementProperties {
  inputAssistancePreset: InputAssistancePreset;
  inputAssistanceCustomKeys: string;
  inputAssistancePosition: 'floating' | 'right';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter';
  restrictedToInputAssistanceChars: boolean;
  hasArrowKeys: boolean;
  hasBackspaceKey: boolean;
  showSoftwareKeyboard: boolean;
  softwareKeyboardShowFrench: boolean;
}

export abstract class TextInputElement extends InputElement implements TextInputElementProperties {
  inputAssistancePreset: InputAssistancePreset;
  inputAssistanceCustomKeys: string;
  inputAssistancePosition: 'floating' | 'right';
  inputAssistanceFloatingStartPosition: 'startBottom' | 'endCenter';
  restrictedToInputAssistanceChars: boolean;
  hasArrowKeys: boolean;
  hasBackspaceKey: boolean;
  showSoftwareKeyboard: boolean;
  softwareKeyboardShowFrench: boolean;

  protected constructor(element: TextInputElementProperties) {
    super(element);
    this.inputAssistancePreset = element.inputAssistancePreset;
    this.inputAssistanceCustomKeys = element.inputAssistanceCustomKeys;
    this.inputAssistancePosition = element.inputAssistancePosition;
    this.inputAssistanceFloatingStartPosition = element.inputAssistanceFloatingStartPosition;
    this.restrictedToInputAssistanceChars = element.restrictedToInputAssistanceChars;
    this.hasArrowKeys = element.hasArrowKeys;
    this.hasBackspaceKey = element.hasBackspaceKey;
    this.showSoftwareKeyboard = element.showSoftwareKeyboard;
    this.softwareKeyboardShowFrench = element.softwareKeyboardShowFrench;
  }
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];
}

export interface PlayerElementBlueprint extends UIElementProperties {
  player: PlayerProperties;
}

export abstract class PlayerElement extends UIElement implements PlayerElementBlueprint {
  player: PlayerProperties;

  protected constructor(element: PlayerElementBlueprint) {
    super(element);
    this.player = element.player;
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: 'playback',
      multiple: false,
      nullable: true,
      values: [],
      valuesComplete: true
    };
  }
}

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
}

export interface PlayerElement extends UIElement {
  player: PlayerProperties;
}
