import { InputElement, LikertRow, UIElement } from '../../models/uI-element';
import { ImportModuleVersion } from '../../classes/importModuleVersion';

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
    if ((serializedElement.value || serializedElement.value === 0) &&
      !ImportModuleVersion.isUnitLoaded() && !ImportModuleVersion.verifyVersion()) {
      this.value = Number(this.value) + 1;
    }
  }
}
