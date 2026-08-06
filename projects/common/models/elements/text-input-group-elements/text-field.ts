import {
  TextInputElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { TextInputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextFieldElement extends TextInputElement implements TextFieldProperties {
  type: UIElementType = 'text-field';
  appearance?: 'fill' | 'outline' = ELEMENT_DEFAULTS['text-field'].appearance;
  textAlign: 'left' | 'center' | 'right' = ELEMENT_DEFAULTS['text-field'].textAlign;
  minLength: number | null = ELEMENT_DEFAULTS['text-field'].minLength;
  minLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field'].minLengthWarnMessage;
  maxLength: number | null = ELEMENT_DEFAULTS['text-field'].maxLength;
  maxLengthWarnMessage: string = ELEMENT_DEFAULTS['text-field'].maxLengthWarnMessage;
  isLimitedToMaxLength: boolean = ELEMENT_DEFAULTS['text-field'].isLimitedToMaxLength;
  pattern: string | null = ELEMENT_DEFAULTS['text-field'].pattern;
  patternWarnMessage: string = ELEMENT_DEFAULTS['text-field'].patternWarnMessage;
  clearable: boolean = ELEMENT_DEFAULTS['text-field'].clearable;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['text-field']);
  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-field']),
      lineHeight: ELEMENT_DEFAULTS['text-field'].lineHeight
    };

  static title: string = 'Eingabefeld';
  static icon: string = 'edit';

  constructor(element?: Partial<TextFieldProperties>, idService?: AbstractIDService) {
    super({ type: 'text-field', ...element }, idService);
    if (isTextFieldProperties(element)) {
      if (element.appearance) this.appearance = element.appearance;
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
      this.styling = { ...this.styling, ...element.styling };
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
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextFieldProperties(blueprint?: Partial<TextFieldProperties>): blueprint is TextFieldProperties {
  if (!blueprint) return false;
  return blueprint.type === 'text-field';
}
