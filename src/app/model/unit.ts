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
    this.width = 600;
    this.height = 350;
    this.backgroundColor = 'yellow';
  }
}

export class UnitUIElement {
  id: string;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  backgroundColor: string;

  constructor(id: string) {
    this.id = id;
    this.xPosition = 0;
    this.yPosition = 0;
    this.width = 50;
    this.height = 30;
    this.backgroundColor = 'green';
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
