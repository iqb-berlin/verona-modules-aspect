export interface Unit {
  pages: UnitPage[];
}

export interface UnitPage {
  sections: UnitPageSection[];
  width: number;
  margin: number;
  backgroundColor: string;
}

export interface UnitPageSection {
  elements: UnitUIElement[];
  width: number;
  height: number;
  backgroundColor: string;
}

export interface BasicUnitUIElement {
  [index: string]: string | number | boolean | string[],
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

export type UnitUIElement =
  CompoundElementCorrection |
  LabelElement |
  ButtonElement |
  TextFieldElement |
  CheckboxElement |
  DropdownElement |
  RadioButtonGroupElement |
  ImageElement |
  AudioElement |
  VideoElement;

export interface CompoundElementCorrection extends BasicUnitUIElement {
  type: 'correction';
  text: string;
  sentences : string[];
}

export interface LabelElement extends BasicUnitUIElement {
  type: 'label';
  label: string;
}

export interface ButtonElement extends BasicUnitUIElement {
  type: 'button';
  label: string;
}

export interface TextFieldElement extends BasicUnitUIElement {
  type: 'text-field';
  placeholder: string;
  multiline: boolean;
}

export interface CheckboxElement extends BasicUnitUIElement {
  type: 'checkbox';
  label: string;
}

export interface DropdownElement extends BasicUnitUIElement {
  type: 'dropdown';
  label: string;
  options: string[];
}

export interface RadioButtonGroupElement extends BasicUnitUIElement {
  type: 'radio';
  text: string;
  options: string[];
  alignment: 'row' | 'column';
}

export interface ImageElement extends BasicUnitUIElement {
  type: 'image';
  src: string;
}

export interface AudioElement extends BasicUnitUIElement {
  type: 'audio';
  src: string;
}

export interface VideoElement extends BasicUnitUIElement {
  type: 'video';
  src: string;
}
