import { InputElement, UIElement } from './uI-element';

export class TextFieldSimpleElement extends InputElement {
  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
  }
}
