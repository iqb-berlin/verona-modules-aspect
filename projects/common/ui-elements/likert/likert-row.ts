import { TextImageLabel } from 'common/interfaces/elements';
import { ElementFactory } from 'common/util/element.factory';
import { InputElement } from 'common/classes/element';

export class LikertRowElement extends InputElement {
  rowLabel: TextImageLabel;
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;
  verticalButtonAlignment: 'auto' | 'center' = 'center';

  constructor(element: Partial<LikertRowElement>) {
    super(element);
    Object.assign(this, element);
    this.rowLabel = ElementFactory.initTextImageLabel();
  }
}
