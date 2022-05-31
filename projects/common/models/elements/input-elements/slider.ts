import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  InputElement,
  PositionedUIElement,
  PositionProperties,
  SchemerData, SchemerValue
} from 'common/models/elements/element';
import { Type } from '@angular/core';
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

  constructor(element: Partial<SliderElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        ...element.styling
      })
    };
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value === 0,
      values: this.getSchemerValues(),
      valuesComplete: true
    };
  }

  private getSchemerValues(): SchemerValue[] {
    return Array.from({ length: (this.maxValue + 1 - this.minValue) }, (_, index) => (
      { value: (index + this.minValue).toString(), label: (index + this.minValue).toString() }
    )) as SchemerValue[];
  }

  getComponentFactory(): Type<ElementComponent> {
    return SliderComponent;
  }
}
