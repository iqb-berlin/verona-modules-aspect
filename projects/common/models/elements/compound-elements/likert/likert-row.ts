import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/compound-elements/likert/likert-radio-button-group.component';
import { TextImageLabel } from 'common/models/elements/label-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import { VariableInfo, VariableValue } from '@iqb/responses';

export class LikertRowElement extends InputElement implements LikertRowProperties {
  type: UIElementType = 'likert-row';
  value: number | null = null;
  rowLabel: TextImageLabel = { text: '', imgSrc: null, imgPosition: 'above' };
  columnCount: number = 0;
  firstColumnSizeRatio: number = 5;
  verticalButtonAlignment: 'auto' | 'center' = 'center';

  constructor(element?: LikertRowProperties) {
    super(element);
    if (element && isValid(element)) {
      this.rowLabel = element.rowLabel;
      this.columnCount = element.columnCount;
      this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      this.verticalButtonAlignment = element.verticalButtonAlignment;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Likert-Row instantiation', element);
      }
      if (element?.rowLabel !== undefined) this.rowLabel = element.rowLabel;
      if (element?.columnCount !== undefined) this.columnCount = element.columnCount;
      if (element?.firstColumnSizeRatio !== undefined) this.firstColumnSizeRatio = element.firstColumnSizeRatio;
      if (element?.verticalButtonAlignment !== undefined) {
        this.verticalButtonAlignment = element.verticalButtonAlignment;
      }
    }
  }

  getVariableInfoOfRow(options: TextImageLabel[]): VariableInfo {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getVariableInfoValues(options),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private getVariableInfoValues(options: TextImageLabel[]): VariableValue[] {
    return options
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }

  getElementComponent(): Type<ElementComponent> {
    return LikertRadioButtonGroupComponent;
  }

  getDuplicate(): LikertRowElement {
    return new LikertRowElement(this);
  }
}

export interface LikertRowProperties extends InputElementProperties {
  rowLabel: TextImageLabel;
  columnCount: number;
  firstColumnSizeRatio: number;
  verticalButtonAlignment: 'auto' | 'center';
}

function isValid(blueprint?: LikertRowProperties): boolean {
  if (!blueprint) return false;
  return blueprint.rowLabel !== undefined &&
    blueprint.columnCount !== undefined &&
    blueprint.firstColumnSizeRatio !== undefined &&
    blueprint.verticalButtonAlignment !== undefined;
}
