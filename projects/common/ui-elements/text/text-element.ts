import {
  FontElement,
  FontProperties, PositionedElement,
  PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class TextElement extends UIElement implements PositionedElement, FontElement, SurfaceElement {
  text: string = 'Lorem ipsum dolor sit amet';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 98;
    // it is okay to discard a 0 value here, as 0 line height makes no sense and it is better to use the default.
    this.fontProps.lineHeight =
      serializedElement.fontProps?.lineHeight as number ||
      serializedElement.lineHeight as number ||
      135;

    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';

    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    if (serializedElement.highlightable || serializedElement.interaction === 'highlightable') {
      this.highlightableYellow = true;
      this.highlightableTurquoise = true;
      this.highlightableOrange = true;
      delete this.interaction;
      delete this.highlightable;
    } else if (serializedElement.interaction === 'underlinable') {
      this.highlightableYellow = true;
      delete this.interaction;
    }
  }
}
