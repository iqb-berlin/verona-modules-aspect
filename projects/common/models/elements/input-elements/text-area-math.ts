import { TextInputElement } from 'common/models/elements/element';
import {
  BasicStyles,
  PositionProperties,
  PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import {
  AbstractIDService,
  MathKeyboardPreset,
  TextInputElementProperties,
  UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextAreaMathElement extends TextInputElement implements TextAreaMathProperties {
  type: UIElementType = 'text-area-math';
  value: TextAreaMath[] = [];
  rowCount: number = ELEMENT_DEFAULTS['text-area-math'].rowCount as number || 2;
  hasAutoHeight: boolean = ELEMENT_DEFAULTS['text-area-math'].hasAutoHeight as boolean || false;
  mathKeyboardPresets: MathKeyboardPreset[] =
    ELEMENT_DEFAULTS['text-area-math'].mathKeyboardPresets as MathKeyboardPreset[] ||
    ['math', 'symbols', 'latin', 'greek'];

  position!: PositionProperties;
  styling!: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Formelbereich';
  static icon: string = 'calculate';

  constructor(element?: Partial<TextAreaMathProperties>, idService?: AbstractIDService) {
    super({ type: 'text-area-math', ...element }, idService);
    if (isTextAreaMathProperties(element)) {
      this.rowCount = element.rowCount;
      this.hasAutoHeight = element.hasAutoHeight;
      this.mathKeyboardPresets = element.mathKeyboardPresets;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at TextAreaMath instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'json',
      format: 'math-text-mix',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }
}

export interface TextAreaMathProperties extends TextInputElementProperties {
  rowCount: number;
  hasAutoHeight: boolean;
  mathKeyboardPresets: MathKeyboardPreset[];
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

export interface TextAreaMath {
  type: 'text' | 'math';
  value: string
}

function isTextAreaMathProperties(blueprint?: Partial<TextAreaMathProperties>): blueprint is TextAreaMathProperties {
  if (!blueprint) return false;
  return blueprint.rowCount !== undefined &&
    blueprint.hasAutoHeight !== undefined &&
    blueprint.mathKeyboardPresets !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    PropertyGroupValidators.isValidKeyInputElementProperties(blueprint) &&
    blueprint.styling?.lineHeight !== undefined;
}
