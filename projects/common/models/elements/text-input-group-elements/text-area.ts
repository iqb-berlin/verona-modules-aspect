import {
  TextInputElement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { TextInputElementProperties, MultiLineTextProperties } from 'common/models/input-element-interfaces';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextAreaElement extends TextInputElement implements TextAreaProperties {
  type: UIElementType = 'text-area';
  appearance: 'fill' | 'outline' = ELEMENT_DEFAULTS['text-area'].appearance;
  textAlign: 'left' | 'center' | 'right' = ELEMENT_DEFAULTS['text-area'].textAlign;
  resizeEnabled: boolean = ELEMENT_DEFAULTS['text-area'].resizeEnabled;
  hasDynamicRowCount: boolean = ELEMENT_DEFAULTS['text-area'].hasDynamicRowCount;
  hasAutoHeight: boolean = ELEMENT_DEFAULTS['text-area'].hasAutoHeight;
  rowCount: number = ELEMENT_DEFAULTS['text-area'].rowCount;
  expectedCharactersCount: number = ELEMENT_DEFAULTS['text-area'].expectedCharactersCount;
  hasReturnKey: boolean = ELEMENT_DEFAULTS['text-area'].hasReturnKey;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['text-area']);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS['text-area']);

  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS['text-area']),
      lineHeight: ELEMENT_DEFAULTS['text-area'].lineHeight
    };

  static title: string = 'Eingabebereich';
  static icon: string = 'edit_note';

  constructor(element?: Partial<TextAreaProperties>, idService?: AbstractIDService) {
    super({ type: 'text-area', ...element }, idService);
    if (isTextAreaProperties(element)) {
      if (element.appearance) this.appearance = element.appearance;
      if (element.textAlign !== undefined) this.textAlign = element.textAlign;
      if (element.resizeEnabled !== undefined) this.resizeEnabled = element.resizeEnabled;
      if (element.rowCount !== undefined) this.rowCount = element.rowCount;
      if (element.hasDynamicRowCount !== undefined) this.hasDynamicRowCount = element.hasDynamicRowCount;
      if (element.hasAutoHeight !== undefined) this.hasAutoHeight = element.hasAutoHeight;
      if (element.expectedCharactersCount !== undefined) this.expectedCharactersCount = element.expectedCharactersCount;
      if (element.hasReturnKey !== undefined) this.hasReturnKey = element.hasReturnKey;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = { ...this.styling, ...element.styling };
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

export interface TextAreaProperties extends TextInputElementProperties, MultiLineTextProperties {
  appearance?: 'fill' | 'outline';
  textAlign: 'left' | 'center' | 'right';
  resizeEnabled: boolean;
  hasDynamicRowCount: boolean;
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
