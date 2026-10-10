import { UIElement } from 'common/models/elements/element';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import {
  DimensionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';

/**
 * An embedded tet.folio experiment: `htmlContent` holds a self-contained HTML document (packed
 * from a tet.folio export zip in the editor), which the component renders in a same-origin srcdoc
 * iframe (not sandboxed - see docs/tetfolio-element.md for what that lets the content reach).
 *
 * The player reports the experiment's state as the element's value, but only to restore it on
 * re-entry: it is not coded. That is why the element keeps the `NO_VALUE` variable info of the base
 * class, as audio and video do for their playback time.
 */
export class TetfolioElement extends UIElement implements TetfolioProperties {
  type: UIElementType = 'tetfolio';
  htmlContent: string = ELEMENT_DEFAULTS.tetfolio.htmlContent;
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
      if (element.dimensions !== undefined) this.dimensions = { ...element.dimensions };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Tetfolio instantiation', element);
    }
  }
}

export interface TetfolioProperties extends UIElementProperties {
  /** No styling: see the class field. */
  styling?: Record<never, never>;
  htmlContent: string;
  dimensions: DimensionProperties;
}

function isTetfolioProperties(
  blueprint?: Partial<TetfolioProperties>): blueprint is TetfolioProperties {
  if (!blueprint) return false;
  return blueprint.type === 'tetfolio';
}
