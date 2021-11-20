import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { InputElement, UIElement } from './uI-element';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class TextAreaElement extends InputElement implements FontElement, SurfaceUIElement {
  appearance: 'standard' | 'legacy' | 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;
  rowCount: number = 3;

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 20;
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  inputAssistancePreset: 'none' | 'french' | 'numbers' | 'numbersAndOperators' = 'none';
  inputAssistancePosition: 'floating' | 'right' = 'floating';

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.height = serializedElement.height || 132;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }
}
