import { Type } from '@angular/core';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  InputElement, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { DropdownComponent } from 'common/components/input-elements/dropdown.component';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, InputElementProperties, OptionElement, TextLabel, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class DropdownElement extends InputElement implements OptionElement, DropdownProperties {
  type: UIElementType = 'dropdown';
  options: TextLabel[] = [];
  allowUnset: boolean = false;
  position: PositionProperties;
  styling: BasicStyles;

  static title: string = 'Klappliste';
  static icon: string = 'menu_open';

  constructor(element?: Partial<DropdownProperties>, idService?: AbstractIDService) {
    super({ type: 'dropdown', ...element }, idService);
    if (isDropdownProperties(element)) {
      this.options = element.options;
      this.allowUnset = element.allowUnset;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Dropdown instantiation', element);
      }
      if (element?.options) this.options = element.options;
      if (element?.allowUnset) this.allowUnset = element.allowUnset;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 240,
        height: 83,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = PropertyGroupGenerators.generateBasicStyleProps(element?.styling);
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

  getElementComponent(): Type<ElementComponent> {
    return DropdownComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}

export interface DropdownProperties extends InputElementProperties {
  options: TextLabel[];
  allowUnset: boolean;
  position: PositionProperties;
  styling: BasicStyles;
}

function isDropdownProperties(blueprint?: Partial<DropdownProperties>): blueprint is DropdownProperties {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.allowUnset !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
