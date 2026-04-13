import { InputElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, InputElementProperties, MathKeyboardPreset, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class MathFieldElement extends InputElement implements MathFieldProperties {
  type: UIElementType = 'math-field';
  enableModeSwitch: boolean = ELEMENT_DEFAULTS['math-field'].enableModeSwitch as boolean;
  mathKeyboardPresets: MathKeyboardPreset[] =
    ELEMENT_DEFAULTS['math-field'].mathKeyboardPresets as MathKeyboardPreset[];

  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['math-field']);
  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['math-field']),
      lineHeight: ELEMENT_DEFAULTS['math-field'].lineHeight as number
    };

  static title: string = 'Formelfeld';
  static icon: string = 'calculate';

  constructor(element?: Partial<MathFieldProperties>, idService?: AbstractIDService) {
    super({ type: 'math-field', ...element }, idService);
    if (isMathFieldProperties(element)) {
      this.enableModeSwitch = element.enableModeSwitch;
      this.mathKeyboardPresets = element.mathKeyboardPresets;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Mathfield instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: 'latex',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }
}

export interface MathFieldProperties extends InputElementProperties {
  enableModeSwitch: boolean;
  mathKeyboardPresets: MathKeyboardPreset[];
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isMathFieldProperties(blueprint?: Partial<MathFieldProperties>): blueprint is MathFieldProperties {
  if (!blueprint) return false;
  return blueprint.enableModeSwitch !== undefined &&
    blueprint.mathKeyboardPresets !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}
