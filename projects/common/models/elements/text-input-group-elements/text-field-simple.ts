import {
  TextInputElement
} from 'common/models/elements/element';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { VariableInfo } from '@iqb/responses';
import { AbstractIDService } from 'common/models/id-interfaces';
import { TextInputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextFieldSimpleElement extends TextInputElement implements TextFieldSimpleProperties {
  type: UIElementType = 'text-field-simple';

  textAlign: 'left' | 'center' | 'right' =
    ELEMENT_DEFAULTS['text-field-simple'].textAlign;

  minLength: number | null = ELEMENT_DEFAULTS['text-field-simple'].minLength;
  minLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field-simple'].minLengthWarnMessage;
  maxLength: number | null = ELEMENT_DEFAULTS['text-field-simple'].maxLength;
  maxLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field-simple'].maxLengthWarnMessage;
  isLimitedToMaxLength: boolean = ELEMENT_DEFAULTS['text-field-simple'].isLimitedToMaxLength;
  pattern: string | null = ELEMENT_DEFAULTS['text-field-simple'].pattern;
  patternWarnMessage: string = ELEMENT_DEFAULTS['text-field-simple'].patternWarnMessage;
  clearable: boolean = ELEMENT_DEFAULTS['text-field-simple'].clearable;
  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-field-simple']),
      lineHeight: ELEMENT_DEFAULTS['text-field-simple'].lineHeight
    };

  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps();

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['text-field-simple']);

  static icon: string = 'edit';

  constructor(element?: Partial<TextFieldSimpleProperties>, idService?: AbstractIDService) {
    super({ type: 'text-field-simple', ...element }, idService);
    if (isTextFieldSimpleProperties(element)) {
      if (element.textAlign !== undefined) this.textAlign = element.textAlign;
      if (element.minLength !== undefined) this.minLength = element.minLength;
      if (element.minLengthWarnMessage !== undefined) this.minLengthWarnMessage = element.minLengthWarnMessage;
      if (element.maxLength !== undefined) this.maxLength = element.maxLength;
      if (element.maxLengthWarnMessage !== undefined) this.maxLengthWarnMessage = element.maxLengthWarnMessage;
      if (element.isLimitedToMaxLength !== undefined) this.isLimitedToMaxLength = element.isLimitedToMaxLength;
      if (element.pattern !== undefined) this.pattern = element.pattern;
      if (element.patternWarnMessage !== undefined) this.patternWarnMessage = element.patternWarnMessage;
      if (element.clearable !== undefined) this.clearable = element.clearable;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = { ...this.styling, ...element.styling };
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
  textAlign: 'left' | 'center' | 'right';
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
