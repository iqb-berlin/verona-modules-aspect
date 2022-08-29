import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputElement, OptionElement,
  PositionedUIElement, PositionProperties, TextImageLabel,
  AnswerScheme, AnswerSchemeValue,
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioGroupImagesComponent } from 'common/components/input-elements/radio-group-images.component';

export class RadioButtonGroupComplexElement extends InputElement implements PositionedUIElement, OptionElement {
  options: TextImageLabel[] = [];
  itemsPerRow: number | null;
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<RadioButtonGroupComplexElement>, ...args: unknown[]) {
    super({ height: 100, ...element }, ...args);
    if (element.options) this.options = [...element.options];
    this.itemsPerRow = element.itemsPerRow !== undefined ? element.itemsPerRow : null;
    this.position = ElementFactory.initPositionProps({ marginBottom: 40, ...element.position });
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  hasAnswerScheme(): boolean {
    return true;
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
    return this.columns
      .map((option, index) => ({ value: (index + 1).toString(), label: option.text })); //TODO iMAGE
  }

  getElementComponent(): Type<ElementComponent> {
    return RadioGroupImagesComponent;
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return ElementFactory.createOptionLabel(optionText, true) as TextImageLabel;
  }
}
