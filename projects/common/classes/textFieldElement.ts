import { initSurfaceElement, initFontElement, InputElement, UIElement } from './uIElement';
import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';

export class TextFieldElement extends InputElement implements FontElement, SurfaceUIElement {
  appearance: 'standard' | 'legacy' | 'fill' | 'outline' = 'outline';
  minLength: number | undefined;
  minLengthWarnMessage: string = 'Eingabe zu kurz';
  maxLength: number | undefined;
  maxLengthWarnMessage: string = 'Eingabe zu lang';
  pattern: string = '';
  patternWarnMessage: string = 'Eingabe entspricht nicht der Vorgabe';

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement());
    Object.assign(this, initSurfaceElement());

    this.height = 100;
    this.backgroundColor = 'transparent';
  }
}
