import { UIElement } from './uI-element';

export class ImageElement extends UIElement {
  src: string = '';
  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    this.height = serializedElement.height || 100;
  }
}
