export interface Unit {
  veronaModuleVersion: string;
  pages: UnitPage[];
}

export interface UnitPage {
  [index: string]: string | number | boolean | undefined | UnitPageSection[];
  id: string;
  sections: UnitPageSection[];
  hasMaxWidth: boolean;
  maxWidth: number;
  margin: number;
  backgroundColor: string;
  alwaysVisible: boolean;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom';
  alwaysVisibleAspectRatio: number;
}

export interface UnitPageSection {
  [index: string]: string | number | boolean | undefined | UnitUIElement[];
  elements: UnitUIElement[];
  height: number;
  backgroundColor: string;
  dynamicPositioning: boolean;
  gridColumnSizes: string;
  gridRowSizes: string;
}

export interface UnitUIElement {
  [index: string]: string | number | boolean | string[] | undefined;
  type: string; // TODO maybe use enum or manual enumeration, because possible values are known
  id: string;
  zIndex: number
  width: number;
  height: number;
  dynamicPositioning: boolean;
  xPosition: number;
  yPosition: number;
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

export interface TextUIElement extends UnitUIElement {
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface InputUIElement extends UnitUIElement {
  label: string;
  value: string | number | boolean | undefined;
  required: boolean;
  requiredWarnMessage: string;
}

export interface SurfaceUIElement extends UnitUIElement {
  backgroundColor: string;
}

export interface CompoundElementCorrection extends UnitUIElement {
  text: string;
  sentences : string[];
}

export interface TextElement extends SurfaceUIElement {
  text: string;
  fontColor: string;
  font: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  highlightable: boolean
}

export interface ButtonElement extends TextUIElement, SurfaceUIElement {
  label: string;
  imageSrc?: string;
  borderRadius?: number;
  action: undefined | 'previous' | 'next' | 'end';
}

export interface TextFieldElement extends InputUIElement, TextUIElement, SurfaceUIElement {
  value: string;
  appearance: 'standard' | 'legacy' | 'fill' | 'outline';
  minLength: number | undefined;
  minLengthWarnMessage: string;
  maxLength: number | undefined;
  maxLengthWarnMessage: string;
  pattern: string;
  patternWarnMessage: string;
}

export interface TextAreaElement extends InputUIElement, TextUIElement, SurfaceUIElement {
  value: string;
  appearance: 'standard' | 'legacy' | 'fill' | 'outline';
  resizeEnabled: boolean;
}

export interface CheckboxElement extends InputUIElement, TextUIElement, SurfaceUIElement {
  value: boolean;
}

export interface DropdownElement extends InputUIElement, TextUIElement, SurfaceUIElement {
  label: string;
  options: string[];
  value: string | undefined;
  allowUnset: boolean;
}

export interface RadioButtonGroupElement extends InputUIElement, TextUIElement, SurfaceUIElement {
  label: string;
  options: string[];
  alignment: 'row' | 'column';
  value: string | undefined;
}

export interface ImageElement extends UnitUIElement {
  src: string;
}

export interface AudioElement extends UnitUIElement {
  src: string;
}

export interface VideoElement extends UnitUIElement {
  src: string;
}
