import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-elements/likert/likert-radio-button-group.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextImageLabel } from 'common/models/elements/label-interfaces';

export class LikertRowElement extends InputElement implements LikertRowProperties {
  type: UIElementType = 'likert-row';
  rowLabel: TextImageLabel;
  columnCount: number;
  firstColumnSizeRatio: number;
  verticalButtonAlignment: 'auto' | 'center';

  constructor(element: LikertRowProperties) {
    super(element);
    this.rowLabel = element.rowLabel;
    this.columnCount = element.columnCount;
    this.firstColumnSizeRatio = element.firstColumnSizeRatio;
    this.verticalButtonAlignment = element.verticalButtonAlignment;
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== 0,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return [
      {
        value: !this.value && this.value !== 0 ? 'null' : (this.value as number + 1).toString(),
        label: InputElement.stripHTML(this.rowLabel.text)
      } // TODO Image
    ];
  }

  getElementComponent(): Type<ElementComponent> {
    return LikertRadioButtonGroupComponent;
  }
}

export interface LikertRowProperties extends InputElementProperties {
  rowLabel: TextImageLabel;
  columnCount: number;
  firstColumnSizeRatio: number;
  verticalButtonAlignment: 'auto' | 'center';
}
