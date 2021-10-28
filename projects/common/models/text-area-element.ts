import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { InputElement, UIElement } from './uI-element';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class TextAreaElement extends InputElement implements FontElement, SurfaceUIElement {
  appearance: 'standard' | 'legacy' | 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  rows: number = 3;

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  inputAssistancePreset: 'none' | 'french' | 'numbers' | 'numbersAndOperators' = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.height = serializedElement.height || 132;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }
}
