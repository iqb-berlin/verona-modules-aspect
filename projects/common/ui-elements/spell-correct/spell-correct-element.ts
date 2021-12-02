import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';
import {
  FontElement,
  FontProperties,
  InputElement,
  PositionProperties,
  SurfaceElement, SurfaceProperties,
  UIElement
} from '../../models/uI-element';

export class SpellCorrectElement extends InputElement implements FontElement, SurfaceElement {
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string || 'transparent';
    this.height = serializedElement.height || 80;
    this.width = serializedElement.width || 230;
  }
}
