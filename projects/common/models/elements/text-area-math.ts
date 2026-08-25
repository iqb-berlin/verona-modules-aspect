import { TextInputElement } from 'common/models/elements/element';
import {
  BasicStyles,
  DimensionProperties,
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  MathKeyboardPreset, TextInputElementProperties, MultiLineTextProperties, MathKeyboardProperties
} from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextAreaMathElement extends TextInputElement implements TextAreaMathProperties {
  type: UIElementType = 'text-area-math';
  value: TextAreaMath[] = [];
  rowCount: number = ELEMENT_DEFAULTS['text-area-math'].rowCount;
  hasAutoHeight: boolean = ELEMENT_DEFAULTS['text-area-math'].hasAutoHeight;
  mathKeyboardPresets: MathKeyboardPreset[] = [...ELEMENT_DEFAULTS['text-area-math'].mathKeyboardPresets];

  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps();

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['text-area-math'].dimensions);

  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-area-math'].styling),
      lineHeight: ELEMENT_DEFAULTS['text-area-math'].styling.lineHeight
    };

  static title: string = 'Formelbereich';
  static icon: string = 'calculate';

  constructor(element?: Partial<TextAreaMathProperties>, idService?: AbstractIDService) {
    super({ type: 'text-area-math', ...element }, idService);
    if (isTextAreaMathProperties(element)) {
      if (element.rowCount !== undefined) this.rowCount = element.rowCount;
      if (element.hasAutoHeight !== undefined) this.hasAutoHeight = element.hasAutoHeight;
      if (element.mathKeyboardPresets !== undefined) this.mathKeyboardPresets = element.mathKeyboardPresets;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
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

export interface TextAreaMathProperties
  extends TextInputElementProperties, MultiLineTextProperties, MathKeyboardProperties {
  position: PositionProperties;
  dimensions: DimensionProperties;
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
  return blueprint.type === 'text-area-math';
}
