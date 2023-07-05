import {
  InputElement, InputElementProperties, UIElement, UIElementType
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import {
  ToggleButtonComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/toggle-button.component';
import { BasicStyles } from 'common/models/elements/property-group-interfaces';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextLabel } from 'common/models/elements/label-interfaces';

export class ToggleButtonElement extends InputElement implements ToggleButtonProperties {
  type: UIElementType = 'toggle-button';
  options: TextLabel[];
  strikeOtherOptions: boolean;
  strikeSelectedOption: boolean;
  verticalOrientation: boolean;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element: ToggleButtonProperties) {
    super(element);
    this.options = element.options;
    this.strikeOtherOptions = element.strikeOtherOptions;
    this.strikeSelectedOption = element.strikeSelectedOption;
    this.verticalOrientation = element.verticalOrientation;
    this.styling = element.styling;
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
      nullable: !this.value && this.value === 0,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return this.options
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }

  getElementComponent(): Type<ElementComponent> {
    return ToggleButtonComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}

export interface ToggleButtonProperties extends InputElementProperties {
  options: TextLabel[];
  strikeOtherOptions: boolean;
  strikeSelectedOption: boolean;
  verticalOrientation: boolean;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };
}
