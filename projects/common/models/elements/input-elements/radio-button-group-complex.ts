import { Type } from '@angular/core';
import {
  BasicStyles, InputElement, OptionElement,
  PositionedUIElement, PositionProperties, TextImageLabel,
  AnswerScheme, AnswerSchemeValue, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';

export class RadioButtonGroupComplexElement extends InputElement implements PositionedUIElement, OptionElement {
  options: TextImageLabel[] = [];
  itemsPerRow: number | null;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<RadioButtonGroupComplexElement>) {
    super({ height: 100, ...element });
    if (element.options) this.options = [...element.options];
    this.itemsPerRow = element.itemsPerRow !== undefined ? element.itemsPerRow : null;
    this.position = UIElement.initPositionProps({ marginBottom: { value: 40, unit: 'px' }, ...element.position });
    this.styling = {
      ...UIElement.initStylingProps({ backgroundColor: 'transparent', ...element.styling })
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
