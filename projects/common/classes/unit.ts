import packageJSON from '../../../package.json';
import { ElementFactory } from 'common/util/element.factory';
import { PositionedUIElement } from 'common/classes/element';

export class Unit {
  type = 'aspect-unit-definition';
  version: string;
  pages: Page[] = [];

  constructor(unit?: Unit) {
    this.version = packageJSON.config.unit_definition_version;
    this.pages = unit?.pages.map(page => new Page(page)) || [new Page()];
  }
}

export class Page {
  [index: string]: any;
  sections: Section[] = [];
  hasMaxWidth: boolean = false;
  maxWidth: number = 900;
  margin: number = 30;
  backgroundColor: string = '#ffffff';
  alwaysVisible: boolean = false;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom' = 'left';
  alwaysVisibleAspectRatio: number = 50;

  constructor(page?: Page) {
    this.sections = page?.sections.map(section => new Section(section)) || [new Section()];
    Object.assign(this, page);
  }
}

export class Section {
  [index: string]: any;
  elements: PositionedUIElement[] = [];
  height: number = 400;
  backgroundColor: string = '#ffffff';
  dynamicPositioning: boolean = true;
  autoColumnSize: boolean = true;
  autoRowSize: boolean = true;
  gridColumnSizes: string = '1fr 1fr';
  gridRowSizes: string = '1fr';
  activeAfterID: string | null = null;

  constructor(section?: Partial<Section>) {
    this.elements = section?.elements?.map(element => ElementFactory.createElement(element) as PositionedUIElement) || [];
    Object.assign(this, section);
  }

  setProperty(property: string, value: any): void {
    this[property] = value;
  }
}
