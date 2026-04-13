import {
  InputElement
} from 'common/models/elements/element';
import { VariableInfo, VariableValue } from '@iqb/responses';
import {
  BasicStyles, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, InputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class CheckboxElement extends InputElement implements CheckboxProperties {
  type: UIElementType = 'checkbox';
  label: string = ELEMENT_DEFAULTS.checkbox.label as string;
  imgSrc: string | null = ELEMENT_DEFAULTS.checkbox.imgSrc as string | null;
  value: boolean = ELEMENT_DEFAULTS.checkbox.value as boolean;
  crossOutChecked: boolean = ELEMENT_DEFAULTS.checkbox.crossOutChecked as boolean;
  styling: BasicStyles = PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.checkbox);

  static title: string = 'Kontrollkästchen';
  static icon: string = 'check_box';

  constructor(element?: Partial<CheckboxProperties>, idService?: AbstractIDService) {
    super({ type: 'checkbox', ...element }, idService);
    if (isCheckboxProperties(element)) {
      this.label = element.label;
      this.imgSrc = element.imgSrc;
      this.value = element.value;
      this.crossOutChecked = element.crossOutChecked;
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Checkbox instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'boolean',
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
    return [
      { value: 'true', label: `Angekreuzt: ${this.label}` },
      { value: 'false', label: `Nicht Angekreuzt: ${this.label}` }
    ];
  }
}

export interface CheckboxProperties extends InputElementProperties {
  label: string;
  imgSrc: string | null;
  value: boolean;
  crossOutChecked: boolean;
  styling: BasicStyles;
}

function isCheckboxProperties(blueprint?: Partial<CheckboxProperties>): blueprint is CheckboxProperties {
  if (!blueprint) return false;
  return blueprint.label !== undefined &&
    blueprint.imgSrc !== undefined &&
    blueprint.crossOutChecked !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
