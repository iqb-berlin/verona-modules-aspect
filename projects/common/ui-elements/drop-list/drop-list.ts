import {
  DragNDropValueObject,
  FontElement,
  FontProperties,
  InputElement,
  PositionedElement, PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class DropListElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  orientation: 'vertical' | 'horizontal' = 'vertical';
  itemBackgroundColor: string = '#add8e6';
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#add8e6';

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.value =
      serializedElement.value !== undefined ? serializedElement.value as DragNDropValueObject[] | null : [];

    this.height = serializedElement.height || 100;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      '#eeeeec';

    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    let oldValues: string[] = [];
    if (serializedElement.options) {
      oldValues = serializedElement.options as string[];
    }
    if (serializedElement.value instanceof Array &&
        serializedElement.value[0] &&
        !(serializedElement.value[0] instanceof Object)) {
      oldValues = this.value as unknown as string[];
    }
    if (oldValues.length > 0) {
      this.value = [];
      oldValues.forEach((stringValue: string, i: number) => {
        (this.value as DragNDropValueObject[]).push({
          id: `${this.id}_value_${i}`,
          stringValue: stringValue
        });
      });
    }
  }
}
