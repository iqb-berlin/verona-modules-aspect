import {
  TextInputElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { TextInputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class SpellCorrectElement extends TextInputElement implements SpellCorrectProperties {
  type: UIElementType = 'spell-correct';
  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps(ELEMENT_DEFAULTS['spell-correct']);

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['spell-correct']);

  // lineHeight is not part of BasicStyles, but it IS part of this element's reality: the initializer
  // below lifts it from the defaults, the editor panel renders it, and a stored value is merged over
  // it on load. The interface used to omit it -- the typed defaults table made that visible (#1177),
  // and since #1187 the declared type is what decides the key set, so omitting it would drop it.
  styling: BasicStyles & { lineHeight: number } = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['spell-correct']),
    lineHeight: ELEMENT_DEFAULTS['spell-correct'].lineHeight
  };

  static title: string = 'Wort korrigieren';
  static icon: string = 'format_strikethrough';

  constructor(element?: Partial<SpellCorrectProperties>, idService?: AbstractIDService) {
    super({ type: 'spell-correct', ...element }, idService);
    if (isSpellCorrectProperties(element)) {
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
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
  styling: BasicStyles & { lineHeight: number };
}

function isSpellCorrectProperties(blueprint?: Partial<SpellCorrectProperties>): blueprint is SpellCorrectProperties {
  if (!blueprint) return false;
  return blueprint.type === 'spell-correct';
}
