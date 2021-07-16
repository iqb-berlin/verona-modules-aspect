export interface Unit {
  pages: UnitPage[];
}

export interface UnitPage {
  sections: UnitPageSection[];
  width: number;
  margin: number;
  backgroundColor: string;
  alwaysVisible: boolean
}

export interface UnitPageSection {
  elements: UnitUIElement[];
  width: number;
  height: number;
  backgroundColor: string;
}

export interface UnitUIElement {
  [index: string]: string | number | boolean | string[],
  type: string; // TODO maybe use enum or manual enumeration, because possible values are known
  id: string;
  xPosition: number;
  yPosition: number;
  zIndex: number
  width: number;
  height: number;
}

export interface TextUIElement extends UnitUIElement {
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface SurfaceUIElement extends UnitUIElement {
  backgroundColor: string;
}

export interface CompoundElementCorrection extends UnitUIElement {
  text: string;
  sentences : string[];
}

export interface TextElement extends TextUIElement, SurfaceUIElement {
  text: string;
}

export interface ButtonElement extends TextUIElement, SurfaceUIElement {
  label: string;
}

export interface TextFieldElement extends TextUIElement, SurfaceUIElement {
  placeholder: string;
  multiline: boolean;
}

export interface CheckboxElement extends TextUIElement, SurfaceUIElement {
  label: string;
}

export interface DropdownElement extends TextUIElement, SurfaceUIElement {
  label: string;
  options: string[];
}

export interface RadioButtonGroupElement extends UnitUIElement, SurfaceUIElement {
  label: string;
  options: string[];
  alignment: 'row' | 'column';
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
