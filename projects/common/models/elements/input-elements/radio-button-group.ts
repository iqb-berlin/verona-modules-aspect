import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputElement, TextLabel, PositionedUIElement, PositionProperties, OptionElement,
  AnswerScheme, AnswerSchemeValue
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioButtonGroupComponent } from 'common/components/input-elements/radio-button-group.component';

export class RadioButtonGroupElement extends InputElement implements PositionedUIElement, OptionElement {
  options: TextLabel[] = [];
  alignment: 'column' | 'row' = 'column';
  strikeOtherOptions: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<RadioButtonGroupElement>) {
    super({ height: 100, ...element });
    if (element.options) this.options = [...element.options];
    if (element.alignment) this.alignment = element.alignment;
    if (element.strikeOtherOptions) this.strikeOtherOptions = element.strikeOtherOptions;
    this.position = ElementFactory.initPositionProps({ marginBottom: 30, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        ...element.styling
      })
    };
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
      .map((option, index) => ({ value: (index + 1).toString(), label: option.text }));
  }

  getElementComponent(): Type<ElementComponent> {
    return RadioButtonGroupComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return ElementFactory.createOptionLabel(optionText) as TextLabel;
  }
}
