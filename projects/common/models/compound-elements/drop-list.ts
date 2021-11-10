import { InputElement, UIElement } from '../uI-element';
import { FontElement, SurfaceUIElement } from '../../interfaces/UIElementInterfaces';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class DropListElement extends InputElement implements FontElement, SurfaceUIElement {
  onlyOneItem: boolean = false;
  connectedTo: string[] = [];
  orientation: 'vertical' | 'horizontal' = 'vertical';

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
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

    this.value = [];
    this.height = serializedElement.height || 100;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }
}
