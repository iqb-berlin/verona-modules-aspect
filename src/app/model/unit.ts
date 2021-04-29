/* eslint-disable max-classes-per-file, @typescript-eslint/no-use-before-define */

export class Unit {
  pages: UnitPage[];

  constructor() {
    this.pages = [new UnitPage()];
  }
}

export class UnitPage {
  elements: UnitUIElement[];
  width: number;
  height: number;
  backgroundColor: string;

  constructor() {
    this.elements = [];
    this.width = 1200;
    this.height = 550;
    this.backgroundColor = '#FFFAF0';
  }
}

export class UnitUIElement {
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

  constructor(id: string) {
    this.id = id;
    this.xPosition = 0;
    this.yPosition = 0;
    this.width = 75;
    this.height = 36;
    this.backgroundColor = 'grey';
    this.fontColor = 'blue';
    this.font = 'Arial';
    this.fontSize = 18;
    this.bold = true;
    this.italic = false;
    this.underline = false;
  }
}

export class LabelElement extends UnitUIElement {
  text: string;

  constructor(id: string, text: string) {
    super(id);
    this.text = text;
  }
}

export class ButtonElement extends UnitUIElement {
  text: string;

  constructor(id: string, text: string) {
    super(id);
    this.text = text;
  }
}

export class TextFieldElement extends UnitUIElement {
  text: string;

  constructor(id: string, text: string) {
    super(id);
    this.text = text;
  }
}
