import { UIElement } from 'common/models/elements/element';
import { environment } from 'common/environment';
import {
  PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class MarkingPanelElement extends UIElement implements MarkingPanelProperties {
  type: UIElementType = 'marking-panel';
  highlightableYellow: boolean = ELEMENT_DEFAULTS['marking-panel'].highlightableYellow as boolean;
  highlightableTurquoise: boolean = ELEMENT_DEFAULTS['marking-panel'].highlightableTurquoise as boolean;
  highlightableOrange: boolean = ELEMENT_DEFAULTS['marking-panel'].highlightableOrange as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS['marking-panel']);

  static title: string = 'Textmarkierung';
  static icon: string = 'border_color';

  constructor(element?: Partial<MarkingPanelProperties>, idService?: AbstractIDService) {
    super({ type: 'marking-panel', ...element }, idService);
    if (isMarkingPanelProperties(element)) {
      this.highlightableOrange = element.highlightableOrange;
      this.highlightableTurquoise = element.highlightableTurquoise;
      this.highlightableYellow = element.highlightableYellow;
      if (element.position) this.position = { ...element.position };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at MarkingPanel instantiation', element);
    }
  }
}

function isMarkingPanelProperties(blueprint?: Partial<MarkingPanelProperties>): blueprint is MarkingPanelProperties {
  if (!blueprint) return false;
  return blueprint.highlightableOrange !== undefined &&
    blueprint.highlightableTurquoise !== undefined &&
    blueprint.highlightableYellow !== undefined;
}

export interface MarkingPanelProperties extends UIElementProperties {
  highlightableYellow: boolean;
  highlightableTurquoise: boolean;
  highlightableOrange: boolean;
  position: PositionProperties;
}
