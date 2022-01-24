import {
  FontElement,
  FontProperties,
  InputElement, PositionedElement,
  PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class DropdownElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  options: string[] = [];
  allowUnset: boolean = false;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.width = serializedElement.width || 240;
    this.height = serializedElement.height || 83;
    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    if (serializedElement.value === 0 && serializedElement.options && serializedElement.options.length) {
      this.value = 1;
    }
  }
}
