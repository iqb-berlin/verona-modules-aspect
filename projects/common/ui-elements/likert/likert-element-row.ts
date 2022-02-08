import { InputElement, LikertRow, UIElement } from '../../models/uI-element';
import { ImportedModuleVersion } from '../../classes/importedModuleVersion';

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
    if ((serializedElement.value !== null) &&
      !ImportedModuleVersion.unitLoaded && !ImportedModuleVersion.isGreaterThanOrEqualTo('1.1.0')) {
      this.value = Number(this.value) + 1;
    }
  }
}
