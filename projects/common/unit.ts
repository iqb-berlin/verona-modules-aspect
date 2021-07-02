export interface Unit {
  pages: UnitPage[];
}

export interface UnitPage {
  sections: UnitPageSection[];
  width: number;
  backgroundColor: string;
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
  width: number;
  height: number;
  backgroundColor: string;
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface CompoundElementCorrection extends UnitUIElement {
  text: string;
  sentences : string[];
}

export interface LabelElement extends UnitUIElement {
  label: string;
}

export interface ButtonElement extends UnitUIElement {
  label: string;
}

export interface TextFieldElement extends UnitUIElement {
  placeholder: string;
  multiline: boolean;
}

export interface CheckboxElement extends UnitUIElement {
  label: string;
}

export interface DropdownElement extends UnitUIElement {
  label: string;
  options: string[];
}

export interface RadioButtonGroupElement extends UnitUIElement {
  text: string;
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
