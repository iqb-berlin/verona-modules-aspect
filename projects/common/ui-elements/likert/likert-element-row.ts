import { InputElement, LikertRow, UIElement } from '../../models/uI-element';

export class LikertElementRow extends InputElement implements LikertRow {
  text: string = '';
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    if (serializedElement.value === 0 && serializedElement.columnCount) {
      this.value = 1;
    }
  }
}
