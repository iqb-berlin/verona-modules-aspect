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

export class TextAreaElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  appearance: 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  rowCount: number = 3;
  inputAssistancePreset: 'none' | 'french' | 'numbers' | 'numbersAndOperators' | 'comparisonOperators' = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    this.height = serializedElement.height || 132;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';
  }
}
