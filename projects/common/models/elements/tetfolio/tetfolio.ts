import { VariableInfo } from '@iqb/responses';
import { UIElement } from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import {
  AbstractIDService, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TetfolioElement extends UIElement implements TetfolioProperties {
  type: UIElementType = 'tetfolio';
  htmlContent: string = ELEMENT_DEFAULTS.tetfolio.htmlContent as string;

  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.tetfolio),
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS.tetfolio)
  };

  state: string | null = ELEMENT_DEFAULTS.tetfolio.state as string | null;

  static title: string = 'Tetfolio';
  static icon: string = 'science';

  constructor(element?: Partial<TetfolioProperties>, idService?: AbstractIDService) {
    super({ type: 'tetfolio', ...element }, idService);
    if (isTetfolioProperties(element)) {
      if (element.htmlContent !== undefined) this.htmlContent = element.htmlContent;
      if (element.styling !== undefined) this.styling = { ...element.styling };
      if (element.state !== undefined) this.state = element.state;
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Tetfolio instantiation', element);
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

export interface TetfolioProperties extends UIElementProperties {
  htmlContent: string;
  styling: BasicStyles & BorderStyles;
  state: string | null;
}

export function isTetfolioProperties(
  blueprint?: Partial<TetfolioProperties>): blueprint is TetfolioProperties {
  if (!blueprint) return false;
  return blueprint.type === 'tetfolio';
}
