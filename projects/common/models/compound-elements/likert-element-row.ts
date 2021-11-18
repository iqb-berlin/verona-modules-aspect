import { InputElement, UIElement } from '../uI-element';
import { LikertRow } from '../../interfaces/UIElementInterfaces';

export class LikertElementRow extends InputElement implements LikertRow {
  text: string = '';
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
  }
}
