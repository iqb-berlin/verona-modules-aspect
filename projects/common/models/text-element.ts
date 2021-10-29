import { UIElement } from './uI-element';
import { SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { initSurfaceElement } from '../util/unit-interface-initializer';

export class TextElement extends UIElement implements SurfaceUIElement {
  text: string = '<p>Lorem ipsum dolor sit amet</p>';
  highlightable: boolean = false;
  underlinable: boolean = false;
  fontColor: string = 'black';
  font: string = 'Roboto';
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initSurfaceElement(serializedElement));
    this.fontColor = serializedElement.fontColor as string || 'black';
    this.font = serializedElement.font as string || 'Roboto';
    this.bold = serializedElement.bold as boolean || false;
    this.italic = serializedElement.italic as boolean || false;
    this.underline = serializedElement.underline as boolean || false;

    this.height = serializedElement.height || 78;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }
}
