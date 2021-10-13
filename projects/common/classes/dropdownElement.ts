import { initSurfaceElement, initFontElement, InputElement, UIElement } from './uIElement';
import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';

export class DropdownElement extends InputElement implements FontElement, SurfaceUIElement {
  options: string[] = [];
  allowUnset: boolean = false;

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

    this.height = 83;
  }
}
