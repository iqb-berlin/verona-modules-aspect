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
  text: string = '<p>Lorem ipsum dolor sit amet</p>';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 78;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';

    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: UIElement): void {
    if (serializedElement.highlightable || serializedElement.interaction === 'highlightable') {
      this.highlightableYellow = true;
      this.highlightableTurquoise = true;
      this.highlightableOrange = true;
    } else if (serializedElement.interaction === 'underlinable') {
      this.highlightableYellow = true;
    }
  }
}
