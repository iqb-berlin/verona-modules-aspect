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
  interaction: 'none' | 'highlightable' | 'underlinable' | 'strikable' = 'none';

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);
    delete this.fontProps.fontSize;

    this.height = serializedElement.height || 78;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';

    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: UIElement): void {
    if (serializedElement.highlightable) { // TODO
      this.interaction = 'highlightable';
    }
  }
}
