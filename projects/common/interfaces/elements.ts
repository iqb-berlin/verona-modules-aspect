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

export interface UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: UIElementType;
  id: string;
  width: number;
  height: number;
  positionProps?: PositionProperties;
  fontProps?: FontProperties;
  surfaceProps?: SurfaceProperties;
  playerProps?: PlayerProperties;
}

export interface InputElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  label?: string;
  // value: InputElementValue;
  value: string[] | string | number | boolean | DragNDropValueObject[] | null;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean;
}

export interface PositionedElement extends UIElement {
  positionProps: PositionProperties;
}

export interface PlayerElement {
  playerProps: PlayerProperties;
}

export interface ValueChangeElement { // TODO weg
  id: string;
  values: [InputElementValue, InputElementValue];
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

export interface FontProperties {
  [index: string]: string | number | boolean | undefined;
  fontColor?: string;
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface SurfaceProperties {
  [index: string]: string;
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
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'button';
  label: string;
  imageSrc: string | null;
  borderRadius: number;
  action: null | 'previous' | 'next' | 'first' | 'last' | 'end';
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface CheckboxElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'checkbox';
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface ClozeElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'cloze';
  document: ClozeDocument;
  positionProps: PositionProperties;
  fontProps: FontProperties;
}

export interface DropdownElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'dropdown';
  options: string[];
  allowUnset: boolean;
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface DropListElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'drop-list';
  onlyOneItem: boolean;
  connectedTo: string[];
  orientation: 'vertical' | 'horizontal' | 'flex';
  itemBackgroundColor: string;
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface DropListSimpleElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'drop-list';
  connectedTo: string[];
  itemBackgroundColor: string;
  highlightReceivingDropList: boolean;
  highlightReceivingDropListColor: string;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface FrameElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'frame';
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  borderRadius: number;
  positionProps: PositionProperties;
  surfaceProps: SurfaceProperties;
}

export interface ImageElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
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
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'likert';
  rows: LikertRowElement[];
  columns: LikertColumn[];
  firstColumnSizeRatio: number;
  lineColoring: boolean;
  lineColoringColor: string;
  readOnly: boolean;
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface LikertRowElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'likert-row';
  text: string;
  columnCount: number;
  firstColumnSizeRatio: number;
}

export interface RadioButtonGroupElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'radio';
  options: string[];
  alignment: 'column' | 'row';
  strikeOtherOptions: boolean;
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface RadioButtonGroupComplexElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'radio-group-images'
  columns: LikertColumn[];
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface SliderElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'slider';
  minValue: number;
  maxValue: number;
  showValues: boolean;
  barStyle: boolean; // TODO besserer name
  thumbLabel: boolean;
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface SpellCorrectElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'spell-correct';
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface TextFieldElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
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
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface TextAreaElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'text-area';
  appearance: 'fill' | 'outline';
  resizeEnabled: boolean;
  rowCount: number;
  inputAssistancePreset: InputAssistancePreset;
  inputAssistancePosition: 'floating' | 'right';
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface TextFieldSimpleElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'text-field';
  fontProps: FontProperties;
}

export interface TextElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'text';
  text: string;
  highlightableOrange: boolean;
  highlightableTurquoise: boolean;
  highlightableYellow: boolean;
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
}

export interface ToggleButtonElement extends InputElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'toggle-button';
  options: string[];
  strikeOtherOptions: boolean;
  selectionColor: string;
  verticalOrientation: boolean;
  dynamicWidth: boolean;
  fontProps: FontProperties,
  surfaceProps: SurfaceProperties,
}

export interface AudioElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'audio';
  src: string;
  positionProps: PositionProperties;
  playerProps: PlayerProperties;
}

export interface VideoElement extends UIElement {
  [index: string]: string | number | boolean | undefined | UIElementType | InputElementValue |
  LikertColumn[] | ClozeDocument |
  PositionProperties | FontProperties | SurfaceProperties | PlayerProperties;
  type: 'video';
  src: string;
  scale: boolean; // TODO besserer name
  positionProps: PositionProperties;
  playerProps: PlayerProperties;
}
