import { UIElement } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MarkingPanelComponent } from 'common/components/text/marking-panel.component';
import { environment } from 'common/environment';
import {
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class MarkingPanelElement extends UIElement implements MarkingPanelProperties {
  type: UIElementType = 'marking-panel';
  highlightableYellow: boolean = true;
  highlightableTurquoise: boolean = false;
  highlightableOrange: boolean = false;
  position?: PositionProperties;

  static title: string = 'Textmarkierung';
  static icon: string = 'border_color';

  constructor(element?: Partial<MarkingPanelProperties>, idService?: AbstractIDService) {
    super({ type: 'marking-panel', ...element }, idService);
    if (isMarkingPanelProperties(element)) {
      this.highlightableOrange = element.highlightableOrange;
      this.highlightableTurquoise = element.highlightableTurquoise;
      this.highlightableYellow = element.highlightableYellow;
      if (element.position) this.position = { ...element.position };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at MarkingPanel instantiation', element);
      }
      if (element?.highlightableOrange !== undefined) this.highlightableOrange = element.highlightableOrange;
      if (element?.highlightableTurquoise !== undefined) this.highlightableTurquoise = element.highlightableTurquoise;
      if (element?.highlightableYellow !== undefined) this.highlightableYellow = element.highlightableYellow;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 98,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 10, unit: 'px' },
        ...element?.position
      });
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return MarkingPanelComponent;
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
  position?: PositionProperties;
}
