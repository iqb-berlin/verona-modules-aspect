import {
  InputElement, UIElement
} from 'common/models/elements/element';
import {
  BasicStyles, DimensionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  AbstractIDService, InputElementProperties, TextLabel, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ToggleButtonElement extends InputElement implements ToggleButtonProperties {
  type: UIElementType = 'toggle-button';
  options: TextLabel[] = ELEMENT_DEFAULTS['toggle-button'].options as TextLabel[];
  strikeOtherOptions: boolean = ELEMENT_DEFAULTS['toggle-button'].strikeOtherOptions as boolean;
  strikeSelectedOption: boolean = ELEMENT_DEFAULTS['toggle-button'].strikeSelectedOption as boolean;
  verticalOrientation: boolean = ELEMENT_DEFAULTS['toggle-button'].verticalOrientation as boolean;
  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['toggle-button'] as any);

  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['toggle-button']),
      lineHeight: ELEMENT_DEFAULTS['toggle-button'].lineHeight as number,
      selectionColor: ELEMENT_DEFAULTS['toggle-button'].selectionColor as string
    };

  static icon: string = 'radio_button_checked';

  constructor(element?: Partial<ToggleButtonProperties>, idService?: AbstractIDService) {
    super({ type: 'toggle-button', ...element }, idService);
    if (isToggleButtonProperties(element)) {
      this.options = [...element.options];
      this.strikeOtherOptions = element.strikeOtherOptions;
      this.strikeSelectedOption = element.strikeSelectedOption;
      this.verticalOrientation = element.verticalOrientation;
      this.dimensions = { ...element.dimensions };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at ToggleButton instantiation', element);
    }
    delete (this as any).label;
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

export interface ToggleButtonProperties extends InputElementProperties {
  options: TextLabel[];
  strikeOtherOptions: boolean;
  strikeSelectedOption: boolean;
  verticalOrientation: boolean;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };
}

function isToggleButtonProperties(blueprint?: Partial<ToggleButtonProperties>): blueprint is ToggleButtonProperties {
  if (!blueprint) return false;
  return blueprint.options !== undefined &&
    blueprint.strikeOtherOptions !== undefined &&
    blueprint.strikeSelectedOption !== undefined &&
    blueprint.verticalOrientation !== undefined &&
    PropertyGroupValidators.isValidDimensionProps(blueprint.dimensions) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.readOnly !== undefined &&
    blueprint.required !== undefined &&
    blueprint.requiredWarnMessage !== undefined &&
    blueprint.styling?.lineHeight !== undefined &&
    blueprint.styling?.selectionColor !== undefined;
}
