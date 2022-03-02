import { ClozeDocument } from './cloze';
import { LikertColumn } from './likert';

export type InputElementValue = string[] | string | number | boolean | DragNDropValueObject[] | null;
export type UIElementType = 'text' | 'button' | 'text-field' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images'
| 'drop-list' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button';
export type InputAssistancePreset = 'none' | 'french' | 'numbers' | 'numbersAndOperators' | 'numbersAndBasicOperators'
| 'comparisonOperators' | 'squareDashDot' | 'placeValue';
export type DragNDropValueObject = {
  id: string;
  stringValue?: string;
  imgSrcValue?: string;
};
export type UIElementValue = string | number | boolean | undefined | UIElementType | InputElementValue |
LikertColumn[] | ClozeDocument |
PositionProperties | ElementStyles | PlayerProperties | BasicStyles;

export interface UIElement {
  [index: string]: UIElementValue;
  type: UIElementType;
  id: string;
  width: number;
  height: number;
  positionProps?: PositionProperties;
  styles: ElementStyles;
  playerProps?: PlayerProperties;
}

export interface InputElement extends UIElement {
  label?: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;
}

export interface PositionedElement extends UIElement {
  positionProps: PositionProperties;
}

export interface PlayerElement extends UIElement {
  playerProps: PlayerProperties;
}

export interface ValueChangeElement {
  id: string;
  value: InputElementValue;
}

export interface PositionProperties {
  [index: string]: string | number | boolean;
  fixedSize: boolean;
  dynamicPositioning: boolean;
  xPosition: number;
  yPosition: number;
  useMinHeight: boolean;
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  zIndex: number;
}

export interface ElementStyles {
  [index: string]: string | number | boolean | undefined;
  fontColor?: string;
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  itemBackgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  lineColoring?: boolean;
  lineColoringColor?: string;
}

export interface BasicStyles extends ElementStyles {
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  backgroundColor: string;
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

export interface ButtonElement extends UIElement {
  type: 'button';
  label: string;
  imageSrc: string | null;
  action: null | 'unitNav' | 'pageNav'
  actionParam: null | 'previous' | 'next' | 'first' | 'last' | 'end' | number;
  positionProps: PositionProperties;
  styles: BasicStyles & {
    borderRadius: number;
  }
}

export interface CheckboxElement extends InputElement {
  type: 'checkbox';
  positionProps: PositionProperties;
  styles: BasicStyles;
}

export interface ClozeElement extends UIElement {
  type: 'cloze';
  document: ClozeDocument;
  positionProps: PositionProperties;
  styles: BasicStyles & {
    lineHeight: number;
  }
}

export interface DropdownElement extends InputElement {
  type: 'dropdown';
  options: string[];
  allowUnset: boolean;
  positionProps: PositionProperties;
  styles: BasicStyles
}

export interface DropListElement extends InputElement {
  type: 'drop-list';
  onlyOneItem: boolean;
  connectedTo: string[];
  orientation: 'vertical' | 'horizontal' | 'flex';
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  positionProps: PositionProperties;
  styles: BasicStyles & {
    itemBackgroundColor: string;
  }
}

export interface DropListSimpleElement extends InputElement {
  type: 'drop-list';
  connectedTo: string[];
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  styles: BasicStyles & {
    itemBackgroundColor: string;
  }
}

export interface FrameElement extends UIElement {
  type: 'frame';
  positionProps: PositionProperties;
  styles: BasicStyles & {
    borderWidth: number;
    borderColor: string;
    borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    borderRadius: number;
  }
}

export interface ImageElement extends UIElement {
  type: 'image';
  src: string;
  scale: boolean;
  magnifier: boolean;
  magnifierSize: number;
  magnifierZoom: number;
  magnifierUsed: boolean;
  positionProps: PositionProperties;
}

export interface LikertElement extends UIElement {
  type: 'likert';
  rows: LikertRowElement[];
  columns: LikertColumn[];
  firstColumnSizeRatio: number;
  readOnly: boolean;
  positionProps: PositionProperties;
  styles: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };
}

export interface LikertRowElement extends InputElement {
  type: 'likert-row';
  text: string;
  columnCount: number;
  firstColumnSizeRatio: number;
}

export interface RadioButtonGroupElement extends InputElement {
  type: 'radio';
  options: string[];
  alignment: 'column' | 'row';
  strikeOtherOptions: boolean;
  positionProps: PositionProperties;
  styles: BasicStyles;
}

export interface RadioButtonGroupComplexElement extends InputElement {
  type: 'radio-group-images' // TODO better name
  columns: LikertColumn[];
  positionProps: PositionProperties;
  styles: BasicStyles;
}

export interface SliderElement extends InputElement {
  type: 'slider';
  minValue: number;
  maxValue: number;
  showValues: boolean;
  barStyle: boolean; // TODO besserer name
  thumbLabel: boolean;
  positionProps: PositionProperties;
  styles: BasicStyles;
}

export interface SpellCorrectElement extends InputElement {
  type: 'spell-correct';
  positionProps: PositionProperties;
  styles: BasicStyles;
}

export interface TextFieldElement extends InputElement {
  type: 'text-field';
  appearance: 'fill' | 'outline';
  minLength: number;
  minLengthWarnMessage: string;
  maxLength: number;
  maxLengthWarnMessage: string;
  pattern: string;
  patternWarnMessage: string;
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  clearable: boolean;
  positionProps: PositionProperties;
  styles: BasicStyles;
}

export interface TextAreaElement extends InputElement {
  type: 'text-area';
  appearance: 'fill' | 'outline';
  resizeEnabled: boolean;
  rowCount: number;
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  positionProps: PositionProperties;
  styles: BasicStyles & {
    lineHeight: number;
  };
}

export interface TextFieldSimpleElement extends InputElement {
  type: 'text-field';
  styles: BasicStyles; // TODO okay? bg-color?
}

export interface TextElement extends UIElement {
  type: 'text';
  text: string;
  highlightableOrange: boolean;
  highlightableTurquoise: boolean;
  highlightableYellow: boolean;
  positionProps: PositionProperties;
  styles: BasicStyles & {
    lineHeight: number;
  }
}

export interface ToggleButtonElement extends InputElement {
  type: 'toggle-button';
  options: string[];
  strikeOtherOptions: boolean;
  selectionColor: string;
  verticalOrientation: boolean;
  dynamicWidth: boolean;
  styles: BasicStyles & {
    lineHeight: number;
  };
}

export interface AudioElement extends UIElement {
  type: 'audio';
  src: string;
  positionProps: PositionProperties;
  playerProps: PlayerProperties;
}

export interface VideoElement extends UIElement {
  type: 'video';
  src: string;
  scale: boolean; // TODO besserer name
  positionProps: PositionProperties;
  playerProps: PlayerProperties;
}
