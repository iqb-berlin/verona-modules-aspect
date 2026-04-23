import {
  TextInputElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, TextInputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextFieldElement extends TextInputElement implements TextFieldProperties {
  type: UIElementType = 'text-field';
  appearance?: 'fill' | 'outline' = ELEMENT_DEFAULTS['text-field'].appearance as 'fill' | 'outline';
  minLength: number | null = ELEMENT_DEFAULTS['text-field'].minLength as number | null;
  minLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field'].minLengthWarnMessage as string;
  maxLength: number | null = ELEMENT_DEFAULTS['text-field'].maxLength as number | null;
  maxLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field'].maxLengthWarnMessage as string;
  isLimitedToMaxLength: boolean = ELEMENT_DEFAULTS['text-field'].isLimitedToMaxLength as boolean;
  pattern: string | null = ELEMENT_DEFAULTS['text-field'].pattern as string | null;
  patternWarnMessage: string = ELEMENT_DEFAULTS['text-field'].patternWarnMessage as string;
  clearable: boolean = ELEMENT_DEFAULTS['text-field'].clearable as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['text-field']);
  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-field']),
      lineHeight: ELEMENT_DEFAULTS['text-field'].lineHeight as number
    };

  static title: string = 'Eingabefeld';
  static icon: string = 'edit';

  constructor(element?: Partial<TextFieldProperties>, idService?: AbstractIDService) {
    super({ type: 'text-field', ...element }, idService);
    if (isTextFieldProperties(element)) {
      if (element.appearance) this.appearance = element.appearance;
      this.minLength = element.minLength;
      this.minLengthWarnMessage = element.minLengthWarnMessage;
      this.maxLength = element.maxLength;
      this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      this.pattern = element.pattern;
      this.patternWarnMessage = element.patternWarnMessage;
      this.clearable = element.clearable;
      if (element.position) this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at TextField instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }
}

export interface TextFieldProperties extends TextInputElementProperties {
  appearance?: 'fill' | 'outline';
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  clearable: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextFieldProperties(blueprint?: Partial<TextFieldProperties>): blueprint is TextFieldProperties {
  if (!blueprint) return false;
  return blueprint.minLength !== undefined &&
    blueprint.minLengthWarnMessage !== undefined &&
    blueprint.maxLength !== undefined &&
    blueprint.maxLengthWarnMessage !== undefined &&
    blueprint.isLimitedToMaxLength !== undefined &&
    blueprint.pattern !== undefined &&
    blueprint.patternWarnMessage !== undefined &&
    blueprint.clearable !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling as BasicStyles) &&
    blueprint.styling?.lineHeight !== undefined;
}
