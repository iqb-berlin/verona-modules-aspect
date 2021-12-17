import {
  PositionedElement,
  UIElement
} from './uI-element';
import { ElementFactory } from '../util/element.factory';

export class Section {
  [index: string]: string | number | boolean | UIElement[] | ((...args: any) => any);
  elements: PositionedElement[] = [];
  height: number = 400;
  backgroundColor: string = 'white';
  dynamicPositioning: boolean = false;
  autoColumnSize: boolean = true;
  autoRowSize: boolean = true;
  gridColumnSizes: string = '1fr 1fr';
  gridRowSizes: string = '1fr';

  constructor(serializedSection?: Section) {
    Object.assign(this, serializedSection);
    this.elements = [];
    if (serializedSection) {
      serializedSection?.elements.forEach((element: UIElement) => {
        this.elements.push(ElementFactory.createElement(element) as PositionedElement);
      });
    }
  }

  addElement(element: PositionedElement): void {
    this.elements.push(element);
  }

  deleteElements(elements: UIElement[]): void {
    this.elements = this.elements.filter(element => !elements.includes(element));
  }

  updateProperty(property: string, value: string | number | boolean): void {
    if (property === 'dynamicPositioning') {
      this.setDynamicPositioning(value as boolean);
    } else {
      this[property] = value;
    }
  }

  private setDynamicPositioning(value: boolean): void {
    this.dynamicPositioning = value;
    this.elements.forEach((element: PositionedElement) => {
      element.positionProps.dynamicPositioning = value;
    });
  }
}
