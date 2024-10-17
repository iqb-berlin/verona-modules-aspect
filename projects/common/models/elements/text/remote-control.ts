import { UIElement, UIElementProperties, UIElementType } from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RemoteControlComponent } from 'common/components/text/remote-control/remote-control.component';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import {
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';

export class RemoteControlElement extends UIElement implements RemoteControlProperties {
  type: UIElementType = 'remote-control';
  highlightableYellow: boolean = true;
  highlightableTurquoise: boolean = false;
  highlightableOrange: boolean = false;
  position?: PositionProperties;

  static title: string = 'Fernsteuerung';
  static icon: string = 'settings_remote';

  constructor(element?: RemoteControlProperties) {
    super(element);
    if (element && isValid(element)) {
      this.highlightableOrange = element.highlightableOrange;
      this.highlightableTurquoise = element.highlightableTurquoise;
      this.highlightableYellow = element.highlightableYellow;
      if (element.position) this.position = { ...element.position };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at RemoteControl instantiation', element);
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

  getDuplicate(): RemoteControlElement {
    return new RemoteControlElement(this);
  }

  getElementComponent(): Type<ElementComponent> {
    return RemoteControlComponent;
  }
}

function isValid(blueprint?: RemoteControlProperties): boolean {
  if (!blueprint) return false;
  return blueprint.highlightableOrange !== undefined &&
    blueprint.highlightableTurquoise !== undefined &&
    blueprint.highlightableYellow !== undefined;
}

export interface RemoteControlProperties extends UIElementProperties {
  highlightableYellow: boolean;
  highlightableTurquoise: boolean;
  highlightableOrange: boolean;
  position?: PositionProperties;
}
