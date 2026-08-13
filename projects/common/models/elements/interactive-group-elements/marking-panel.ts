import { UIElement } from 'common/models/elements/element';
import { environment } from 'common/environment';
import {
  PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  HighlightableProperties, UIElementProperties, UIElementType
} from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class MarkingPanelElement extends UIElement implements MarkingPanelProperties {
  type: UIElementType = 'marking-panel';
  highlightableYellow: boolean = ELEMENT_DEFAULTS['marking-panel'].highlightableYellow;
  highlightableTurquoise: boolean = ELEMENT_DEFAULTS['marking-panel'].highlightableTurquoise;
  highlightableOrange: boolean = ELEMENT_DEFAULTS['marking-panel'].highlightableOrange;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['marking-panel']);

  /* No styling at all: not one of this element's templates reads a styling value, and the group it
     used to get came from the base class rather than from any declaration (#1226). Declared here so
     the merge in the constructor keeps nothing and the inspector offers nothing.

     Deleting this field compiles: the inherited `styling: Stylings` is assignable to the interface's
     optional empty group, because every object is. What holds the emptiness is the spec in
     element.spec.ts, not the type. */
  styling: Record<never, never> = {};

  static title: string = 'Textmarkierung';
  static icon: string = 'border_color';

  constructor(element?: Partial<MarkingPanelProperties>, idService?: AbstractIDService) {
    super({ type: 'marking-panel', ...element }, idService);
    if (isMarkingPanelProperties(element)) {
      if (element.highlightableOrange !== undefined) this.highlightableOrange = element.highlightableOrange;
      if (element.highlightableTurquoise !== undefined) this.highlightableTurquoise = element.highlightableTurquoise;
      if (element.highlightableYellow !== undefined) this.highlightableYellow = element.highlightableYellow;
      this.position = { ...this.position, ...element.position };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at MarkingPanel instantiation', element);
    }
  }
}

function isMarkingPanelProperties(blueprint?: Partial<MarkingPanelProperties>): blueprint is MarkingPanelProperties {
  if (!blueprint) return false;
  return blueprint.type === 'marking-panel';
}

export interface MarkingPanelProperties extends UIElementProperties, HighlightableProperties {
  /** No styling: see the class field (#1226). */
  styling?: Record<never, never>;
  position: PositionProperties;
}
