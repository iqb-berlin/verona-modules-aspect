import { InputElement, UIElement } from '../uI-element';

export class LikertElementRow extends InputElement {
  text: string = '';
  columnCount: number = 0;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
  }
}
