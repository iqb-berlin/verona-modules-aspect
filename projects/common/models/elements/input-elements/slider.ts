import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputElement, PositionedUIElement, PositionProperties, AnswerScheme, AnswerSchemeValue
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SliderComponent } from 'common/components/input-elements/slider.component';

export class SliderElement extends InputElement implements PositionedUIElement {
  minValue: number = 0;
  maxValue: number = 100;
  showValues: boolean = true;
  barStyle: boolean = false;
  thumbLabel: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<SliderElement>, ...args: unknown[]) {
    super(element, ...args);
    if (element.minValue) this.minValue = element.minValue;
    if (element.maxValue !== undefined) this.maxValue = element.maxValue;
    if (element.showValues !== undefined) this.showValues = element.showValues;
    if (element.barStyle) this.barStyle = element.barStyle;
    if (element.thumbLabel) this.thumbLabel = element.thumbLabel;
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        ...element.styling
      })
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
    return Array.from({ length: (this.maxValue + 1 - this.minValue) }, (_, index) => (
      { value: (index + this.minValue).toString(), label: (index + this.minValue).toString() }
    )) as AnswerSchemeValue[];
  }

  getElementComponent(): Type<ElementComponent> {
    return SliderComponent;
  }
}
