import {
  InputElement, UIElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService,
  InputElementProperties,
  OptionElement,
  TextImageLabel,
  UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class RadioButtonGroupComplexElement extends InputElement
  implements OptionElement, RadioButtonGroupComplexProperties {
  type: UIElementType = 'radio-group-images';
  label: string = ELEMENT_DEFAULTS['radio-group-images'].label as string;
  options: TextImageLabel[] = [...ELEMENT_DEFAULTS['radio-group-images'].options as TextImageLabel[]];
  itemsPerRow: number | null = ELEMENT_DEFAULTS['radio-group-images'].itemsPerRow as number | null;
  position!: PositionProperties;
  styling!: BasicStyles;

  static title: string = 'Optionsfelder (mit Bild)';
  static icon: string = 'radio_button_checked';

  constructor(element?: Partial<RadioButtonGroupComplexProperties>, idService?: AbstractIDService) {
    super({ type: 'radio-group-images', ...element }, idService);
    if (isRadioButtonGroupComplexProperties(element)) {
      this.label = element.label;
      this.options = [...element.options];
      this.itemsPerRow = element.itemsPerRow;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at RadioButtonGroupComplex instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getVariableInfoValues(),
      valuePositionLabels: [],
      page: '',
      valuesComplete: true
    }];
  }

  private getVariableInfoValues(): VariableValue[] {
    return this.options
      .map((option, index) => ({
        value: (index + 1).toString(),
        label: InputElement.stripHTML(option.text)
      }));
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return UIElement.createOptionLabel(optionText, true) as TextImageLabel;
  }
}

export interface RadioButtonGroupComplexProperties extends InputElementProperties {
  label: string;
  options: TextImageLabel[];
  itemsPerRow: number | null;
  position: PositionProperties;
  styling: BasicStyles;
}

function isRadioButtonGroupComplexProperties(blueprint?: Partial<RadioButtonGroupComplexProperties>)
  : blueprint is RadioButtonGroupComplexProperties {
  if (!blueprint) return false;
  return blueprint.label !== undefined &&
    blueprint.options !== undefined &&
    blueprint.itemsPerRow !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
