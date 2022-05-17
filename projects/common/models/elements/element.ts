import { ElementFactory } from 'common/util/element.factory';
import { ElementComponent } from 'common/directives/element-component.directive';
import { Type } from '@angular/core';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-field-simple' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images'
| 'drop-list' | 'drop-list-simple' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button';

export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
TextImageLabel[] | ClozeDocument | TextImageLabel |
PositionProperties | PlayerProperties | BasicStyles;

export type InputAssistancePreset = null | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue';

export abstract class UIElement {
  [index: string]: any;
  id: string = 'id_placeholder';
  type: UIElementType;
  width: number = 180;
  height: number = 60;
  position?: PositionProperties;
  styling?: BasicStyles & ExtendedStyles;
  player?: PlayerProperties;

  constructor(element: Partial<UIElement>) {
    Object.assign(this, element);
    if (!element.type) throw Error('Element has no type!');
    this.type = element.type;
  }

  setProperty(property: string, value: UIElementValue): void {
    this[property] = value;
  }

  setStyleProperty(property: string, value: UIElementValue): void {
    (this.styling as { [key: string]: any })[property] = value;
  }

  setPositionProperty(property: string, value: UIElementValue): void {
    (this.position as { [key: string]: any })[property] = value;
  }

  setPlayerProperty(property: string, value: UIElementValue): void {
    (this.player as { [key: string]: any })[property] = value;
  }

  abstract getComponentFactory(): Type<ElementComponent>;
}

export type InputElementValue = string[] | string | number | boolean | DragNDropValueObject[] | null;

export abstract class InputElement extends UIElement {
  label: string = 'Beschriftung';
  value: InputElementValue = null;
  required: boolean = false;
  requiredWarnMessage: string = 'Eingabe erforderlich';
  readOnly: boolean = false;

  protected constructor(element: Partial<InputElement>) {
    super(element);
    Object.assign(this, element);
  }
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
}

export interface PositionedUIElement extends UIElement {
  position: PositionProperties;
}

export interface PositionProperties {
  [index: string]: string | number | boolean | null;
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
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  backgroundColor: string;
}

export interface ExtendedStyles {
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
  [index: string]: string | number | boolean | null;
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

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export interface TextImageLabel {
  text: string;
  imgSrc: string | null;
  position: 'above' | 'below' | 'left' | 'right';
}

export type DragNDropValueObject = {
  id: string;
  stringValue?: string;
  imgSrcValue?: string;
};
