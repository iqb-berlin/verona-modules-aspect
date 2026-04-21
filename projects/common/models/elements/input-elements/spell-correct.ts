import {
  TextInputElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, TextInputElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class SpellCorrectElement extends TextInputElement implements SpellCorrectProperties {
  type: UIElementType = 'spell-correct';
  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps(ELEMENT_DEFAULTS['spell-correct']);

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['spell-correct']);

  styling: BasicStyles = PropertyGroupGenerators
    .generateBasicStyleProps(ELEMENT_DEFAULTS['spell-correct']);

  static title: string = 'Wort korrigieren';
  static icon: string = 'format_strikethrough';

  constructor(element?: Partial<SpellCorrectProperties>, idService?: AbstractIDService) {
    super({ type: 'spell-correct', ...element }, idService);
    if (isSpellCorrectProperties(element)) {
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at SpellCorrect instantiation', element);
    }
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: '',
      multiple: false,
      nullable: true,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }
}

export interface SpellCorrectProperties extends TextInputElementProperties {
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles;
}

function isSpellCorrectProperties(blueprint?: Partial<SpellCorrectProperties>): blueprint is SpellCorrectProperties {
  if (!blueprint) return false;
  return blueprint.type === 'spell-correct';
}
