import { UIElement } from './uIElement';

export class VideoElement extends UIElement {
  src: string = '';

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);

    this.height = 100;
  }
}
