import { ClozeDocument } from './cloze';

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
TextImageLabel[] | ClozeDocument | TextImageLabel |
PositionProperties | ElementStyling | PlayerProperties | BasicStyles;

export interface UIElement {
  [index: string]: UIElementValue;
  type: UIElementType;
  id: string;
  width: number;
  height: number;
  position?: PositionProperties; // position
  styling?: ElementStyling; // styling
  player?: PlayerProperties; // player
}

export interface InputElement extends UIElement {
  label?: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;
}

export interface PositionedElement extends UIElement {
  position: PositionProperties;
}

export interface PlayerElement extends UIElement {
  player: PlayerProperties;
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

export interface ElementStyling {
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

export interface BasicStyles extends ElementStyling {
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
  asLink: boolean;
  action: null | 'unitNav' | 'pageNav'
  actionParam: null | 'previous' | 'next' | 'first' | 'last' | 'end' | number;
  position: PositionProperties;
  styling: BasicStyles & {
    borderRadius: number;
  }
}

export interface CheckboxElement extends InputElement {
  type: 'checkbox';
  position: PositionProperties;
  styling: BasicStyles;
}

export interface ClozeElement extends UIElement {
  type: 'cloze';
  document: ClozeDocument;
  columnCount: number;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  }
}

export interface DropdownElement extends InputElement {
  type: 'dropdown';
  options: string[];
  allowUnset: boolean;
  position: PositionProperties;
  styling: BasicStyles
}

export interface DropListElement extends InputElement {
  type: 'drop-list';
  onlyOneItem: boolean;
  connectedTo: string[];
  copyOnDrop: boolean;
  orientation: 'vertical' | 'horizontal' | 'flex';
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  position: PositionProperties;
  styling: BasicStyles & {
    itemBackgroundColor: string;
  }
}

export interface DropListSimpleElement extends InputElement {
  type: 'drop-list';
  connectedTo: string[];
  copyOnDrop: boolean;
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  styling: BasicStyles & {
    itemBackgroundColor: string;
  }
}

export interface FrameElement extends UIElement {
  type: 'frame';
  position: PositionProperties;
  styling: BasicStyles & {
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
  position: PositionProperties;
}

export interface LikertElement extends UIElement {
  type: 'likert';
  rows: LikertRowElement[];
  columns: TextImageLabel[];
  firstColumnSizeRatio: number;
  readOnly: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };
}

export interface LikertRowElement extends InputElement {
  type: 'likert-row';
  rowLabel: TextImageLabel;
  columnCount: number;
  firstColumnSizeRatio: number;
  verticalButtonAlignment: 'auto' | 'center';
}

export interface RadioButtonGroupElement extends InputElement {
  type: 'radio';
  richTextOptions: string[];
  alignment: 'column' | 'row';
  strikeOtherOptions: boolean;
  position: PositionProperties;
  styling: BasicStyles;
}

export interface RadioButtonGroupComplexElement extends InputElement {
  type: 'radio-group-images' // TODO better name
  columns: TextImageLabel[];
  position: PositionProperties;
  styling: BasicStyles;
}

export interface SliderElement extends InputElement {
  type: 'slider';
  minValue: number;
  maxValue: number;
  showValues: boolean;
  barStyle: boolean; // TODO besserer name
  thumbLabel: boolean;
  position: PositionProperties;
  styling: BasicStyles;
}

export interface SpellCorrectElement extends InputElement {
  type: 'spell-correct';
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  restrictedToInputAssistanceChars: boolean;
  showSoftwareKeyboard: boolean;
  softwareKeyboardShowFrench: boolean;
  position: PositionProperties;
  styling: BasicStyles;
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
  restrictedToInputAssistanceChars: boolean;
  showSoftwareKeyboard: boolean;
  softwareKeyboardShowFrench: boolean;
  clearable: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

export interface TextAreaElement extends InputElement {
  type: 'text-area';
  appearance: 'fill' | 'outline';
  resizeEnabled: boolean;
  rowCount: number;
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  restrictedToInputAssistanceChars: boolean;
  showSoftwareKeyboard: boolean;
  softwareKeyboardShowFrench: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

export interface TextElement extends UIElement {
  type: 'text';
  text: string;
  highlightableOrange: boolean;
  highlightableTurquoise: boolean;
  highlightableYellow: boolean;
  columnCount: number;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  }
}

export interface ToggleButtonElement extends InputElement {
  type: 'toggle-button';
  richTextOptions: string[];
  strikeOtherOptions: boolean;
  verticalOrientation: boolean;
  dynamicWidth: boolean;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };
}

export interface AudioElement extends UIElement {
  type: 'audio';
  src: string;
  position: PositionProperties;
  player: PlayerProperties;
}

export interface VideoElement extends UIElement {
  type: 'video';
  src: string;
  scale: boolean; // TODO besserer name
  position: PositionProperties;
  player: PlayerProperties;
}
