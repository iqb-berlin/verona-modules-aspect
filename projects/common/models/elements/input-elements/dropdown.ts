import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, OptionElement, PositionedUIElement, UIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropdownComponent } from 'common/components/input-elements/dropdown.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextLabel } from 'common/models/elements/label-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class DropdownElement extends InputElement implements PositionedUIElement, OptionElement, DropdownProperties {
  type: UIElementType = 'dropdown';
  options: TextLabel[];
  allowUnset: boolean;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: DropdownProperties) {
    super(element);
    this.options = element.options;
    this.allowUnset = element.allowUnset;
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
      nullable: this.allowUnset,
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
    return DropdownComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}

export interface DropdownProperties extends InputElementProperties {
  options: TextLabel[];
  allowUnset: boolean;
  position: PositionProperties;
  styling: BasicStyles;
}
