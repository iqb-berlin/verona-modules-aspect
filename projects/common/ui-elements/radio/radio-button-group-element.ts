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

export class RadioButtonGroupElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  options: string[] = [];
  alignment: 'column' | 'row' = 'column';
  strikeOtherOptions: boolean = false;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 85;
    if (serializedElement.marginBottom !== undefined) {
      this.positionProps.marginBottom = serializedElement.marginBottom;
    } else if (serializedElement.positionProps?.marginBottom !== undefined) {
      this.positionProps.marginBottom = serializedElement.positionProps.marginBottom;
    } else {
      this.positionProps.marginBottom = 30;
    }
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';
  }
}
