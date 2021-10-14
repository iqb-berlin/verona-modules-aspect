import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { initSurfaceElement, initFontElement, UIElement } from './uIElement';

export class ButtonElement extends UIElement implements FontElement, SurfaceUIElement {
  label: string = 'Knopf';
  imageSrc: string | null = null;
  borderRadius: number = 0;
  action: null | 'previous' | 'next' | 'end' = null;

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
  }
}
