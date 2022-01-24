import {
  FontElement,
  FontProperties,
  InputElement,
  LikertColumn, PositionedElement, PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class RadioGroupImagesElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  columns: LikertColumn[] = []; // TODO

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 100;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';
    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    if (serializedElement.value === 0 && serializedElement.columns && serializedElement.columns.length) {
      this.value = 1;
    }
  }
}
