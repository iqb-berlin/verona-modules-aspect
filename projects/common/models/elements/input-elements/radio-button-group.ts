import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, OptionElement, PositionedUIElement, UIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioButtonGroupComponent } from 'common/components/input-elements/radio-button-group.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextLabel } from 'common/models/elements/label-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class RadioButtonGroupElement extends InputElement
  implements PositionedUIElement, OptionElement, RadioButtonGroupProperties {
  type: UIElementType = 'radio';
  options: TextLabel[] = [];
  alignment: 'column' | 'row' = 'column';
  strikeOtherOptions: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: RadioButtonGroupProperties) {
    super(element);
    this.options = element.options;
    this.alignment = element.alignment;
    this.strikeOtherOptions = element.strikeOtherOptions;
    this.position = element.position;
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
      nullable: !this.value && this.value !== 0,
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
    return RadioButtonGroupComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}

export interface RadioButtonGroupProperties extends InputElementProperties {
  options: TextLabel[];
  alignment: 'column' | 'row';
  strikeOtherOptions: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}
