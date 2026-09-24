import { VariableInfo } from '@iqb/responses';
import { UIElement } from 'common/models/elements/element';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import {
  DimensionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';

/** An embedded Tetfolio unit: `htmlContent` holds a self-contained HTML document (packed from a
   Tetfolio export zip in the editor), which the component renders in a same-origin blob-URL
   iframe (not sandboxed - see docs/tetfolio-element.md for the trust model). `state` is
   the serialized answer state the embedded app reports back over the message bridge. */
export class TetfolioElement extends UIElement implements TetfolioProperties {
  type: UIElementType = 'tetfolio';
  htmlContent: string = ELEMENT_DEFAULTS.tetfolio.htmlContent;
  state: string | null = ELEMENT_DEFAULTS.tetfolio.state;
  /** Full group, not just width/height: the component reads `isHeightFixed`, `minHeight` and
     `maxHeight` to decide whether and how far the iframe follows its content's height. */
  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS.tetfolio.dimensions);

  /** No styling: the iframe document brings its own styles, no template reads a styling value. */
  styling: Record<never, never> = {};

  static title: string = 'Tetfolio';
  static icon: string = 'science';

  constructor(element?: Partial<TetfolioProperties>, idService?: AbstractIDService) {
    super({ type: 'tetfolio', ...element }, idService);
    if (isTetfolioProperties(element)) {
      if (element.htmlContent !== undefined) this.htmlContent = element.htmlContent;
      if (element.state !== undefined) this.state = element.state;
      if (element.dimensions !== undefined) this.dimensions = { ...element.dimensions };
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
  /** No styling: see the class field. */
  styling?: Record<never, never>;
  htmlContent: string;
  state: string | null;
  dimensions: DimensionProperties;
}

function isTetfolioProperties(
  blueprint?: Partial<TetfolioProperties>): blueprint is TetfolioProperties {
  if (!blueprint) return false;
  return blueprint.type === 'tetfolio';
}
