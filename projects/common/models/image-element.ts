import { UIElement } from './uI-element';

export class ImageElement extends UIElement {
  src: string = '';
  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.height = serializedElement.height || 100;
  }
}
