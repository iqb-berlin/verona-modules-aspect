import {
  FontElement,
  FontProperties,
  InputElement,
  PositionProperties,
  SurfaceElement, SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class SliderElement extends InputElement implements FontElement, SurfaceElement {
  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;
  minValue: number = 0;
  maxValue: number = 100;
  showValues: boolean = true;
  barStyle: boolean = false;
  thumbLabel: boolean = false;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string || 'transparent';
    this.height = serializedElement.height || 75;
    this.width = serializedElement.width || 300;
  }
}
