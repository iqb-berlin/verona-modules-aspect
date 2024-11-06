import { Type } from '@angular/core';
import {
  InputElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SliderComponent } from 'common/components/input-elements/slider.component';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, InputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class SliderElement extends InputElement implements SliderProperties {
  type: UIElementType = 'slider';
  minValue: number = 0;
  maxValue: number = 100;
  showValues: boolean = true;
  barStyle: boolean = false;
  thumbLabel: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Schieberegler';
  static icon: string = 'linear_scale';

  constructor(element?: Partial<SliderProperties>, idService?: AbstractIDService) {
    super({ type: 'slider', ...element }, idService);
    if (isSliderProperties(element)) {
      this.minValue = element.minValue;
      this.maxValue = element.maxValue;
      this.showValues = element.showValues;
      this.barStyle = element.barStyle;
      this.thumbLabel = element.thumbLabel;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Slider instantiation', element);
      }
      if (element?.minValue) this.minValue = element.minValue;
      if (element?.maxValue) this.maxValue = element.maxValue;
      if (element?.showValues) this.showValues = element.showValues;
      if (element?.barStyle) this.barStyle = element.barStyle;
      if (element?.thumbLabel) this.thumbLabel = element.thumbLabel;
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 135
      };
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: !this.value && this.value !== 0,
      values: this.getVariableInfoValues(),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    }];
  }

  private getVariableInfoValues(): VariableValue[] {
    return Array.from({ length: (this.maxValue + 1 - this.minValue) }, (_, index) => (
      { value: (index + this.minValue).toString(), label: (index + this.minValue).toString() }
    )) as VariableValue[];
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

function isSliderProperties(blueprint?: Partial<SliderProperties>): blueprint is SliderProperties {
  if (!blueprint) return false;
  return blueprint.minValue !== undefined &&
    blueprint.maxValue !== undefined &&
    blueprint.showValues !== undefined &&
    blueprint.barStyle !== undefined &&
    blueprint.thumbLabel !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}
