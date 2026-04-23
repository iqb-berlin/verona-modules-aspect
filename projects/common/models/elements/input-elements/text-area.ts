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

export class TextAreaElement extends TextInputElement implements TextAreaProperties {
  type: UIElementType = 'text-area';
  appearance: 'fill' | 'outline' = ELEMENT_DEFAULTS['text-area'].appearance as 'fill' | 'outline';
  resizeEnabled: boolean = ELEMENT_DEFAULTS['text-area'].resizeEnabled as boolean;
  hasDynamicRowCount: boolean = ELEMENT_DEFAULTS['text-area'].hasDynamicRowCount as boolean;
  hasAutoHeight: boolean = ELEMENT_DEFAULTS['text-area'].hasAutoHeight as boolean;
  rowCount: number = ELEMENT_DEFAULTS['text-area'].rowCount as number;
  expectedCharactersCount: number = ELEMENT_DEFAULTS['text-area'].expectedCharactersCount as number;
  hasReturnKey: boolean = ELEMENT_DEFAULTS['text-area'].hasReturnKey as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['text-area']);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS['text-area']);

  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-area']),
      lineHeight: ELEMENT_DEFAULTS['text-area'].lineHeight as number
    };

  static title: string = 'Eingabebereich';
  static icon: string = 'edit_note';

  constructor(element?: Partial<TextAreaProperties>, idService?: AbstractIDService) {
    super({ type: 'text-area', ...element }, idService);
    if (isTextAreaProperties(element)) {
      if (element.appearance) this.appearance = element.appearance;
      this.resizeEnabled = element.resizeEnabled;
      this.rowCount = element.rowCount;
      this.hasDynamicRowCount = element.hasDynamicRowCount;
      this.hasAutoHeight = element.hasAutoHeight;
      this.expectedCharactersCount = element.expectedCharactersCount;
      this.hasReturnKey = element.hasReturnKey;
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at TextArea instantiation', element);
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

export interface TextAreaProperties extends TextInputElementProperties {
  appearance?: 'fill' | 'outline';
  resizeEnabled: boolean;
  hasDynamicRowCount: boolean;
  hasAutoHeight: boolean;
  rowCount: number;
  expectedCharactersCount: number;
  hasReturnKey: boolean;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextAreaProperties(blueprint?: Partial<TextAreaProperties>): blueprint is TextAreaProperties {
  if (!blueprint) return false;
  return blueprint.rowCount !== undefined &&
    blueprint.type === 'text-area';
}
