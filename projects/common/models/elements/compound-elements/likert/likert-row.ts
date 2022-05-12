import { InputElement, TextImageLabel } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-elements/likert/likert-radio-button-group.component';

export class LikertRowElement extends InputElement {
  rowLabel: TextImageLabel = { text: '', imgSrc: null, position: 'above' };
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;
  verticalButtonAlignment: 'auto' | 'center' = 'center';

  constructor(element: Partial<LikertRowElement>) {
    super(element);
    Object.assign(this, element);
  }

  getComponentFactory(): Type<ElementComponent> {
    return LikertRadioButtonGroupComponent;
  }
}
