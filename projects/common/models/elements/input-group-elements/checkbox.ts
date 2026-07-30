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

export class CheckboxElement extends InputElement implements CheckboxProperties {
  type: UIElementType = 'checkbox';
  label: string = ELEMENT_DEFAULTS.checkbox.label as string;
  imgSrc: string | null = ELEMENT_DEFAULTS.checkbox.imgSrc as string | null;
  value: boolean = ELEMENT_DEFAULTS.checkbox.value as boolean;
  crossOutChecked: boolean = ELEMENT_DEFAULTS.checkbox.crossOutChecked as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.checkbox);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.checkbox);

  styling: BasicStyles = PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.checkbox);

  static title: string = 'Kontrollkästchen';
  static icon: string = 'check_box';

  constructor(element?: Partial<CheckboxProperties>, idService?: AbstractIDService) {
    super({ type: 'checkbox', ...element }, idService);
    if (isCheckboxProperties(element)) {
      if (element.label !== undefined) this.label = element.label;
      if (element.imgSrc !== undefined) this.imgSrc = element.imgSrc;
      if (element.value !== undefined) this.value = element.value;
      if (element.crossOutChecked !== undefined) this.crossOutChecked = element.crossOutChecked;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = { ...this.styling, ...element.styling };
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
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
  /**
   * Image in place of the text label. Not to be confused with `PlayerProperties.imgSrc`, which is a
   * player still image and sits under `element.player`.
   */
  imgSrc: string | null;
  value: boolean;
  crossOutChecked: boolean;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles;
}

function isCheckboxProperties(blueprint?: Partial<CheckboxProperties>): blueprint is CheckboxProperties {
  if (!blueprint) return false;
  return blueprint.type === 'checkbox';
}
