import {
  TextInputElement
} from 'common/models/elements/element';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { VariableInfo } from '@iqb/responses';
import { AbstractIDService, TextInputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextFieldSimpleElement extends TextInputElement implements TextFieldSimpleProperties {
  type: UIElementType = 'text-field-simple';
  minLength: number | null = ELEMENT_DEFAULTS['text-field-simple'].minLength as number | null;
  minLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field-simple'].minLengthWarnMessage as string;
  maxLength: number | null = ELEMENT_DEFAULTS['text-field-simple'].maxLength as number | null;
  maxLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field-simple'].maxLengthWarnMessage as string;
  isLimitedToMaxLength: boolean = ELEMENT_DEFAULTS['text-field-simple'].isLimitedToMaxLength as boolean;
  pattern: string | null = ELEMENT_DEFAULTS['text-field-simple'].pattern as string | null;
  patternWarnMessage: string = ELEMENT_DEFAULTS['text-field-simple'].patternWarnMessage as string;
  clearable: boolean = ELEMENT_DEFAULTS['text-field-simple'].clearable as boolean;
  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-field-simple']),
      lineHeight: ELEMENT_DEFAULTS['text-field-simple'].lineHeight as number
    };

  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps(ELEMENT_DEFAULTS['text-field-simple']);

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['text-field-simple']);

  static icon: string = 'edit';

  constructor(element?: Partial<TextFieldSimpleProperties>, idService?: AbstractIDService) {
    super({ type: 'text-field-simple', ...element }, idService);
    if (isTextFieldSimpleProperties(element)) {
      this.minLength = element.minLength;
      this.minLengthWarnMessage = element.minLengthWarnMessage;
      this.maxLength = element.maxLength;
      this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      this.pattern = element.pattern;
      this.patternWarnMessage = element.patternWarnMessage;
      this.clearable = element.clearable;
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at TextFieldSimple instantiation', element);
    }
    delete (this as Partial<TextInputElement>).label;
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

export interface TextFieldSimpleProperties extends TextInputElementProperties {
  minLength: number | null;
  minLengthWarnMessage: string;
  maxLength: number | null;
  maxLengthWarnMessage: string;
  isLimitedToMaxLength: boolean;
  pattern: string | null;
  patternWarnMessage: string;
  clearable: boolean;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextFieldSimpleProperties(blueprint?: Partial<TextFieldSimpleProperties>)
  : blueprint is TextFieldSimpleProperties {
  if (!blueprint) return false;
  return blueprint.minLength !== undefined &&
    blueprint.type === 'text-field-simple';
}
