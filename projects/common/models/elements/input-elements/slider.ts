import {
  InputElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, InputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class SliderElement extends InputElement implements SliderProperties {
  type: UIElementType = 'slider';
  minValue: number = ELEMENT_DEFAULTS.slider.minValue as number;
  maxValue: number = ELEMENT_DEFAULTS.slider.maxValue as number;
  showValues: boolean = ELEMENT_DEFAULTS.slider.showValues as boolean;
  barStyle: boolean = ELEMENT_DEFAULTS.slider.barStyle as boolean;
  thumbLabel: boolean = ELEMENT_DEFAULTS.slider.thumbLabel as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.slider);
  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.slider),
      lineHeight: (ELEMENT_DEFAULTS.slider as any).lineHeight as number || 100
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
    } else if (environment.strictInstantiation) {
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
