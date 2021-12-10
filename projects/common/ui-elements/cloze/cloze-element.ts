import {
  ClozePart,
  CompoundElement,
  FontElement,
  FontProperties,
  PositionedElement, PositionProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement } from '../../util/unit-interface-initializer';

// TODO styles like em dont continue after inserted components

export class ClozeElement extends CompoundElement implements PositionedElement, FontElement {
  text: string = 'Lorem ipsum dolor \\r sdfsdf \\i sdfsdf';
  parts: ClozePart[][] = [];

  positionProps: PositionProperties;
  fontProps: FontProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);

    if (serializedElement?.parts) {
      serializedElement?.parts.forEach((subParts: ClozePart[]) => {
        subParts.forEach((part: ClozePart) => {
          if (!['p', 'h1', 'h2', 'h3', 'h4'].includes(part.type)) {
            part.value = this.createElement(part.value as UIElement);
          }
        });
      });
    }

    this.width = serializedElement.width || 450;
    this.height = serializedElement.height || 200;
  }
}
