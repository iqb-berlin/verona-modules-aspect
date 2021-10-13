import { initSurfaceElement, initFontElement, UIElement } from './uIElement';
import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';

export class TextElement extends UIElement implements FontElement, SurfaceUIElement {
  text: string = '<p>Lorem ipsum dolor sit amet</p>';
  highlightable: boolean = false;

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

    this.height = 78;
    this.backgroundColor = 'transparent';
  }
}
