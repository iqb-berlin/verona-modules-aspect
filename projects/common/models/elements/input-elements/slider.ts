import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, PositionedUIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SliderComponent } from 'common/components/input-elements/slider.component';
import { AnswerScheme, AnswerSchemeValue } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class SliderElement extends InputElement implements PositionedUIElement, SliderProperties {
  type: UIElementType = 'slider';
  minValue: number;
  maxValue: number;
  showValues: boolean;
  barStyle: boolean;
  thumbLabel: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: SliderProperties) {
    super(element);
    this.minValue = element.minValue;
    this.maxValue = element.maxValue;
    this.showValues = element.showValues;
    this.barStyle = element.barStyle;
    this.thumbLabel = element.thumbLabel;
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
    return Array.from({ length: (this.maxValue + 1 - this.minValue) }, (_, index) => (
      { value: (index + this.minValue).toString(), label: (index + this.minValue).toString() }
    )) as AnswerSchemeValue[];
  }

  getElementComponent(): Type<ElementComponent> {
    return SliderComponent;
  }
}

export interface SliderProperties extends InputElementProperties {
  minValue: number;
  maxValue: number;
  showValues: boolean;
  barStyle: boolean;
  thumbLabel: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}
