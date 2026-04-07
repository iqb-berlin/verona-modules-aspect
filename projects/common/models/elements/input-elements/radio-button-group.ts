import { InputElement, UIElement } from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, InputElementProperties, OptionElement, TextLabel, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class RadioButtonGroupElement extends InputElement implements OptionElement, RadioButtonGroupProperties {
  type: UIElementType = 'radio';
  label: string = ELEMENT_DEFAULTS.radio.label as string;
  options: TextLabel[] = ELEMENT_DEFAULTS.radio.options as TextLabel[];
  alignment: 'column' | 'row' = ELEMENT_DEFAULTS.radio.alignment as 'column' | 'row';
  strikeOtherOptions: boolean = ELEMENT_DEFAULTS.radio.strikeOtherOptions as boolean;
  declare position: PositionProperties;
  declare styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Optionsfelder';
  static icon: string = 'radio_button_checked';

  constructor(element?: Partial<RadioButtonGroupProperties>, idService?: AbstractIDService) {
    super({ type: 'radio', ...element }, idService);
    if (isRadioButtonGroupProperties(element)) {
      this.label = element.label;
      this.options = [...element.options];
      this.alignment = element.alignment;
      this.strikeOtherOptions = element.strikeOtherOptions;
      if (element.position) this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at RadioButtonGroupElement instantiation', element);
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

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}

export interface RadioButtonGroupProperties extends InputElementProperties {
  label: string;
  options: TextLabel[];
  alignment: 'column' | 'row';
  strikeOtherOptions: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isRadioButtonGroupProperties(blueprint?: Partial<RadioButtonGroupProperties>)
  : blueprint is RadioButtonGroupProperties {
  if (!blueprint) return false;
  return blueprint.label !== undefined &&
    blueprint.options !== undefined &&
    blueprint.alignment !== undefined &&
    blueprint.strikeOtherOptions !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}
