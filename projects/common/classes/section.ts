import {
  UIElement
} from './uIElement';
import * as ElementFactory from '../util/element.factory';

export class Section {
  [index: string]: string | number | boolean | UIElement[] | ((...args: any) => any);
  elements: UIElement[] = [];
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
        this.elements.push(ElementFactory.createElement(element));
      });
    }
  }

  async addElement(elementType: string, coordinates: { x: number; y: number } | undefined): Promise<void> {
    this.elements.push(ElementFactory.createElement({ type: elementType } as UIElement, coordinates));
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
    this.elements.forEach((element: UIElement) => {
      element.dynamicPositioning = value;
    });
  }

  duplicateElements(elements: UIElement[]): void {
    elements.forEach((element: UIElement) => {
      const newElementConfig: Record<string, string | number | boolean | string[]> = { ...element } as
        Record<string, string | number | boolean | string[]>;
      delete newElementConfig.id; // remove ID from object, so a new one is created
      const newElement: UIElement = ElementFactory.createElement(newElementConfig as UIElement);
      newElement.xPosition += 10;
      newElement.yPosition += 10;
      this.elements.push(newElement);
    });
  }

  static alignElements(elements: UIElement[], alignmentDirection: 'left' | 'right' | 'top' | 'bottom'): void {
    let newValue: number;
    switch (alignmentDirection) {
      case 'left':
        newValue = Math.min(...elements.map(element => element.xPosition));
        elements.forEach((element: UIElement) => {
          element.xPosition = newValue;
        });
        break;
      case 'right':
        newValue = Math.max(...elements.map(element => element.xPosition + element.width));
        elements.forEach((element: UIElement) => {
          element.xPosition = newValue - element.width;
        });
        break;
      case 'top':
        newValue = Math.min(...elements.map(element => element.yPosition));
        elements.forEach((element: UIElement) => {
          element.yPosition = newValue;
        });
        break;
      case 'bottom':
        newValue = Math.max(...elements.map(element => element.yPosition + element.height));
        elements.forEach((element: UIElement) => {
          element.yPosition = newValue - element.height;
        });
        break;
      // no default
    }
  }
}
