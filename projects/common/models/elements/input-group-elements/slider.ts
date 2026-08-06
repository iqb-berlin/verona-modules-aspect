import {
  InputElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class SliderElement extends InputElement implements SliderProperties {
  type: UIElementType = 'slider';
  minValue: number = ELEMENT_DEFAULTS.slider.minValue;
  maxValue: number = ELEMENT_DEFAULTS.slider.maxValue;
  showValues: boolean = ELEMENT_DEFAULTS.slider.showValues;
  barStyle: boolean = ELEMENT_DEFAULTS.slider.barStyle;
  thumbLabel: boolean = ELEMENT_DEFAULTS.slider.thumbLabel;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps();

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.slider);

  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(),
      lineHeight: ELEMENT_DEFAULTS.slider.lineHeight
    };

  static title: string = 'Schieberegler';
  static icon: string = 'linear_scale';

  constructor(element?: Partial<SliderProperties>, idService?: AbstractIDService) {
    super({ type: 'slider', ...element }, idService);
    if (isSliderProperties(element)) {
      if (element.minValue !== undefined) this.minValue = element.minValue;
      if (element.maxValue !== undefined) this.maxValue = element.maxValue;
      if (element.showValues !== undefined) this.showValues = element.showValues;
      if (element.barStyle !== undefined) this.barStyle = element.barStyle;
      if (element.thumbLabel !== undefined) this.thumbLabel = element.thumbLabel;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = { ...this.styling, ...element.styling };
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Slider instantiation', element);
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
}

export interface SliderProperties extends InputElementProperties {
  minValue: number;
  maxValue: number;
  showValues: boolean;
  barStyle: boolean;
  thumbLabel: boolean;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isSliderProperties(blueprint?: Partial<SliderProperties>): blueprint is SliderProperties {
  if (!blueprint) return false;
  return blueprint.minValue !== undefined &&
    blueprint.maxValue !== undefined &&
    blueprint.type === 'slider';
}
