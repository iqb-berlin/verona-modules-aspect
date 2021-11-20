import { InputElement, UIElement } from './uI-element';
import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class CheckboxElement extends InputElement implements FontElement, SurfaceUIElement {
  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 20;
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

    this.value = serializedElement.value as boolean || false; // booleans are always initialized false

    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }
}
