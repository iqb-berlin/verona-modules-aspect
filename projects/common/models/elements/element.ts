// eslint-disable-next-line max-classes-per-file
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { ElementFactory } from 'common/util/element.factory';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images' | 'hotspot-image'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button' | 'geometry';

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextLabel | TextLabel[] | ClozeDocument | LikertRowElement[] | Hotspot[] |
PositionProperties | PlayerProperties | BasicStyles;

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue' | 'space' | 'comma';

export abstract class UIElement {
  [index: string]: unknown;
  id: string;
  type: UIElementType;
  width: number = 180;
  height: number = 60;
  position?: PositionProperties;
  styling?: BasicStyles & ExtendedStyles;
  player?: PlayerProperties;

  constructor(element: Partial<UIElement>) {
    if (!element.type) throw Error('Element has no type!');
    this.type = element.type;
    this.id = element.id || 'id_placeholder';
    if (element.width !== undefined) this.width = element.width;
    if (element.height !== undefined) this.height = element.height;
  }

  setProperty(property: string, value: UIElementValue): void {
    this[property] = value;
  }

  setStyleProperty(property: string, value: UIElementValue): void {
    (this.styling as BasicStyles & ExtendedStyles)[property] = value;
  }

  setPositionProperty(property: string, value: UIElementValue): void {
    (this.position as PositionProperties)[property] = value;
  }

  setPlayerProperty(property: string, value: UIElementValue): void {
    (this.player as PlayerProperties)[property] = value;
  }

  getChildElements(): UIElement[] {
    return [];
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerSchemeValues);
  }

  abstract getElementComponent(): Type<ElementComponent>;
}

export type InputElementValue = string[] | string | number | boolean | TextLabel[] | null | Hotspot[] | boolean[];

export abstract class InputElement extends UIElement {
  label: string = 'Beschriftung';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(element: Partial<InputElement>) {
    super(element);
    if (element.label !== undefined) this.label = element.label;
    if (element.value !== undefined) this.value = element.value;
    if (element.required) this.required = element.required;
    if (element.requiredWarnMessage !== undefined) this.requiredWarnMessage = element.requiredWarnMessage;
    if (element.readOnly) this.readOnly = element.readOnly;
  }

  abstract getAnswerScheme(options?: unknown): AnswerScheme;
}

export abstract class CompoundElement extends UIElement {
  abstract getChildElements(): UIElement[];
}

export abstract class PlayerElement extends UIElement {
  player: PlayerProperties;

  protected constructor(element: Partial<PlayerElement>) {
    super(element);
    this.player = ElementFactory.initPlayerProps(element.player);
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

export interface AnswerSchemeValue {
  value: string;
  label: string;
}

export interface AnswerScheme {
  id: string;
  type: string;
  format?: string;
  multiple?: boolean;
  nullable?: boolean;
  values?: AnswerSchemeValue[];
  valuesComplete?: boolean;
}

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
}

export interface PositionProperties {
  [index: string]: unknown;
  fixedSize: boolean;
  dynamicPositioning: boolean;
  xPosition: number;
  yPosition: number;
  useMinHeight: boolean;
  gridColumn: number | null;
  gridColumnRange: number;
  gridRow: number | null;
  gridRowRange: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  zIndex: number;
}

export interface BasicStyles {
  [index: string]: unknown;
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  backgroundColor: string;
}

export interface ExtendedStyles {
  [index: string]: unknown;
  lineHeight?: number;
  borderRadius?: number;
  itemBackgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  lineColoring?: boolean;
  lineColoringColor?: string;
  selectionColor?: string;
}

export interface PlayerElement {
  player: PlayerProperties;
}

export interface PlayerProperties {
  [index: string]: unknown;
  autostart: boolean;
  autostartDelay: number;
  loop: boolean;
  startControl: boolean;
  pauseControl: boolean;
  progressBar: boolean;
  interactiveProgressbar: boolean;
  volumeControl: boolean;
  defaultVolume: number;
  minVolume: number;
  muteControl: boolean;
  interactiveMuteControl: boolean;
  hintLabel: string;
  hintLabelDelay: number;
  activeAfterID: string;
  minRuns: number;
  maxRuns: number | null;
  showRestRuns: boolean;
  showRestTime: boolean;
  playbackTime: number;
}

export interface Hotspot {
  top: number;
  left: number;
  width: number;
  height: number;
  shape: 'ellipse' | 'rect';
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  rotation: number;
  value: boolean;
  readOnly: boolean
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export interface OptionElement extends UIElement {
  getNewOptionLabel(optionText: string): Label;
}

export interface TextLabel {
  text: string;
}

export interface TextImageLabel extends TextLabel {
  imgSrc: string | null;
  imgPosition: 'above' | 'below' | 'left' | 'right';
}

export interface DragNDropValueObject extends TextImageLabel {
  id: string;
}

export type Label = TextLabel | TextImageLabel | DragNDropValueObject;
