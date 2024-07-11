import { Type } from '@angular/core';
import {
  InputElement, InputElementProperties, OptionElement, UIElement, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RadioButtonGroupComponent } from 'common/components/input-elements/radio-button-group.component';
import { VariableInfo, VariableValue } from '@iqb/responses';
import { TextLabel } from 'common/models/elements/label-interfaces';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class RadioButtonGroupElement extends InputElement implements OptionElement, RadioButtonGroupProperties {
  type: UIElementType = 'radio';
  options: TextLabel[] = [];
  alignment: 'column' | 'row' = 'column';
  strikeOtherOptions: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Optionsfelder';
  static icon: string = 'radio_button_checked';

  constructor(element?: RadioButtonGroupProperties) {
    super(element);
    if (element && isValid(element)) {
      this.options = [...element.options];
      this.alignment = element.alignment;
      this.strikeOtherOptions = element.strikeOtherOptions;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at RadioButtonGroupElement instantiation', element);
      }
      if (element?.options) this.options = [...element.options];
      if (element?.alignment) this.alignment = element.alignment;
      if (element?.strikeOtherOptions) this.strikeOtherOptions = element.strikeOtherOptions;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 100,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 135
      };
    }
  }

  getDuplicate(): RadioButtonGroupElement {
    return new RadioButtonGroupElement(this);
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
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

  getElementComponent(): Type<ElementComponent> {
    return RadioButtonGroupComponent;
  }

  getNewOptionLabel(optionText: string): TextLabel {
    return UIElement.createOptionLabel(optionText) as TextLabel;
  }
}

export interface RadioButtonGroupProperties extends InputElementProperties {
  options: TextLabel[];
  alignment: 'column' | 'row';
  strikeOtherOptions: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isValid(blueprint?: RadioButtonGroupProperties): boolean {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.alignment !== undefined &&
    blueprint.strikeOtherOptions !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined;
}
