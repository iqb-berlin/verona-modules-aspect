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

export class TextFieldElement extends InputElement implements PositionedElement, FontElement, SurfaceElement {
  appearance: 'standard' | 'legacy' | 'fill' | 'outline' = 'outline';
  minLength: number = 0;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number = 0;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string = '';
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';
  inputAssistancePreset: 'none' | 'french' | 'numbers' | 'numbersAndOperators' = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';
  clearable: boolean = false;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
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
  }
}
