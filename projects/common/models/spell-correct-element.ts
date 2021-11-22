import { FontElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { InputElement, UIElement } from './uI-element';
import { initFontElement, initSurfaceElement } from '../util/unit-interface-initializer';

export class SpellCorrectElement extends InputElement implements FontElement, SurfaceUIElement {
  bold: boolean = false;
  font: string = 'Roboto';
  fontColor: string = 'black';
  fontSize: number = 18;
  italic: boolean = false;
  lineHeight: number = 120;
  underline: boolean = false;
  backgroundColor: string = '#AAA0';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.backgroundColor = serializedElement.backgroundColor as string || '#d3d3d300';
    this.height = serializedElement.height || 80;
    this.width = serializedElement.width || 200;
  }
}
