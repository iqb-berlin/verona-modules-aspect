import { Type } from '@angular/core';
import { InputElement, SchemerData, SchemerValue, TextImageLabel } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-elements/likert/likert-radio-button-group.component';

export class LikertRowElement extends InputElement {
  rowLabel: TextImageLabel = { text: '', imgSrc: null, position: 'above' };
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;
  verticalButtonAlignment: 'auto' | 'center' = 'center';

  constructor(element: Partial<LikertRowElement>, ...args: unknown[]) {
    super(element, ...args);
    if (element.rowLabel) this.rowLabel = element.rowLabel;
    if (element.columnCount) this.columnCount = element.columnCount;
    if (element.firstColumnSizeRatio) this.firstColumnSizeRatio = element.firstColumnSizeRatio;
    if (element.verticalButtonAlignment) this.verticalButtonAlignment = element.verticalButtonAlignment;
  }

  hasSchemerData(): boolean {
    return true;
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== 0,
      values: this.getSchemerValues(),
      valuesComplete: true
    };
  }

  private getSchemerValues(): SchemerValue[] {
    console.log(this.value);
    return [
      { value: !this.value && this.value !== 0 ? 'null' : (this.value as number + 1).toString(),
        label: this.rowLabel.text } // TODO Image
    ];
  }

  getComponentFactory(): Type<ElementComponent> {
    return LikertRadioButtonGroupComponent;
  }
}
