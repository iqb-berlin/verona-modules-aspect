import { PositionedUIElement, UIElement } from 'common/models/elements/element';
import { ElementFactory } from 'common/util/element.factory';

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
    Object.assign(this, section);
    this.elements =
      section?.elements?.map(element => ElementFactory.createElement(element.type, element) as PositionedUIElement) ||
      [];
  }

  setProperty(property: string, value: any): void {
    this[property] = value;
  }

  getElements(): UIElement[] {
    return this.elements;
  }
}
