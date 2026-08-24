import {
  InputElement, UIElement
} from 'common/models/elements/element';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { VariableInfo, VariableValue } from '@iqb/responses';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { TextLabel } from 'common/models/label-interfaces';
import { StrikeOtherOptionsProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ToggleButtonElement extends InputElement implements ToggleButtonProperties {
  type: UIElementType = 'toggle-button';
  options: TextLabel[] = ELEMENT_DEFAULTS['toggle-button'].options;
  strikeOtherOptions: boolean = ELEMENT_DEFAULTS['toggle-button'].strikeOtherOptions;
  strikeSelectedOption: boolean = ELEMENT_DEFAULTS['toggle-button'].strikeSelectedOption;
  verticalOrientation: boolean = ELEMENT_DEFAULTS['toggle-button'].verticalOrientation;
  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['toggle-button'].dimensions);

  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps();

  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['toggle-button'].styling),
      lineHeight: ELEMENT_DEFAULTS['toggle-button'].styling.lineHeight,
      selectionColor: ELEMENT_DEFAULTS['toggle-button'].styling.selectionColor
    };

  static icon: string = 'radio_button_checked';

  constructor(element?: Partial<ToggleButtonProperties>, idService?: AbstractIDService) {
    super({ type: 'toggle-button', ...element }, idService);
    if (isToggleButtonProperties(element)) {
      if (element.options !== undefined) this.options = [...element.options];
      if (element.strikeOtherOptions !== undefined) this.strikeOtherOptions = element.strikeOtherOptions;
      if (element.strikeSelectedOption !== undefined) this.strikeSelectedOption = element.strikeSelectedOption;
      if (element.verticalOrientation !== undefined) this.verticalOrientation = element.verticalOrientation;
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.position = { ...this.position, ...element.position };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at ToggleButton instantiation', element);
    }
    delete (this as Partial<ToggleButtonElement>).label;
  }

  setProperty(property: string, value: unknown): void {
    super.setProperty(property, value);
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

export interface ToggleButtonProperties extends InputElementProperties, StrikeOtherOptionsProperties {
  options: TextLabel[];
  strikeSelectedOption: boolean;
  verticalOrientation: boolean;
  dimensions: DimensionProperties;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };
}

function isToggleButtonProperties(blueprint?: Partial<ToggleButtonProperties>): blueprint is ToggleButtonProperties {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.type === 'toggle-button';
}
