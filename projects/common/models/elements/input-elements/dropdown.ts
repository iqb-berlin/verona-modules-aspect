import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  InputElement, UIElement
} from 'common/models/elements/element';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, InputElementProperties, OptionElement, TextLabel, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class DropdownElement extends InputElement implements OptionElement, DropdownProperties {
  type: UIElementType = 'dropdown';
  options: TextLabel[] = ELEMENT_DEFAULTS.dropdown.options as TextLabel[];
  allowUnset: boolean = ELEMENT_DEFAULTS.dropdown.allowUnset as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.dropdown as any);
  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.dropdown as any);
  styling: BasicStyles = PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.dropdown as any);

  static title: string = 'Klappliste';
  static icon: string = 'menu_open';

  constructor(element?: Partial<DropdownProperties>, idService?: AbstractIDService) {
    super({ type: 'dropdown', ...element }, idService);
    if (isDropdownProperties(element)) {
      this.options = element.options;
      this.allowUnset = element.allowUnset;
      this.position = { ...element.position };
      this.dimensions = { ...element.dimensions };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Dropdown instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: this.allowUnset,
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

export interface DropdownProperties extends InputElementProperties {
  options: TextLabel[];
  allowUnset: boolean;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles;
}

function isDropdownProperties(blueprint?: Partial<DropdownProperties>): blueprint is DropdownProperties {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.allowUnset !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidDimensionProps(blueprint.dimensions) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
