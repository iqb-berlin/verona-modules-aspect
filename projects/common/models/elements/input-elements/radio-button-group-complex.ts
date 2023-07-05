import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, OptionElement, PositionedUIElement, UIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { TextImageLabel } from 'common/models/elements/label-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class RadioButtonGroupComplexElement extends InputElement
  implements PositionedUIElement, OptionElement, RadioButtonGroupComplexProperties {
  type: UIElementType = 'radio-group-images';
  options: TextImageLabel[];
  itemsPerRow: number | null;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: RadioButtonGroupComplexProperties) {
    super(element);
    this.options = element.options;
    this.itemsPerRow = element.itemsPerRow;
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
    return RadioGroupImagesComponent;
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return UIElement.createOptionLabel(optionText, true) as TextImageLabel;
  }
}

export interface RadioButtonGroupComplexProperties extends InputElementProperties {
  options: TextImageLabel[];
  itemsPerRow: number | null;
  position: PositionProperties;
  styling: BasicStyles;
}
