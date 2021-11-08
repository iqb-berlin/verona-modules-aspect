import { UIElement } from './uI-element';

export class ImageElement extends UIElement {
  src: string = '';
  magnifier: boolean = false;
  magnifierSize: number = 100;
  magnifierZoom: number = 1.5;
  magnifierUsed: boolean = false;
  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.height = serializedElement.height || 100;
  }
}
