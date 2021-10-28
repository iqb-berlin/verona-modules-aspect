import { InputElement, UIElement } from './uI-element';
import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class TextFieldElement extends InputElement implements FontElement, SurfaceUIElement {
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

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.height = serializedElement.height || 100;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }
}
