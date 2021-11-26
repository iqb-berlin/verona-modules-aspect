import {
  FontElement,
  FontProperties, PositionedElement,
  PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class ButtonElement extends UIElement implements PositionedElement, FontElement, SurfaceElement {
  label: string = 'Knopf';
  imageSrc: string | null = null;
  borderRadius: number = 0;
  action: null | 'previous' | 'next' | 'first' | 'last' | 'end' = null;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);
  }
}
