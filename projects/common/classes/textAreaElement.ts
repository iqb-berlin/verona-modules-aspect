import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { InputElement, UIElement } from './uIElement';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class TextAreaElement extends InputElement implements FontElement, SurfaceUIElement {
  appearance: 'standard' | 'legacy' | 'fill' | 'outline' = 'outline';
  resizeEnabled: boolean = false;

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  inputAssistance: boolean = false;
  inputAssistancePreset: 'french' | 'numbers' | 'operators' | null = null;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement());
    Object.assign(this, initSurfaceElement());

    this.backgroundColor = 'transparent';
    this.height = 12;
  }
}
