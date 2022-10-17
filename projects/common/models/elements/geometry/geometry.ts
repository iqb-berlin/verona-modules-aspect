import { Type } from '@angular/core';
import {
  PositionedUIElement, PositionProperties, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryComponent } from 'common/components/geometry/geometry.component';

export class GeometryElement extends UIElement implements PositionedUIElement {
  appDefinition: string = '';
  width: number = 600;
  height: number = 400;
  showResetIcon: boolean = true;
  showToolbar: boolean = true;
  enableShiftDragZoom: boolean = true;
  showZoomButtons: boolean = true;
  showFullscreenButton: boolean = true;
  position: PositionProperties;

  constructor(element: Partial<GeometryElement>) {
    super(element);
    this.appDefinition = element.appDefinition !== undefined ? element.appDefinition : '';
    this.showResetIcon = element.showResetIcon !== undefined ? element.showResetIcon : true;

    this.position = UIElement.initPositionProps({ ...element.position });
  }

  getElementComponent(): Type<ElementComponent> {
    return GeometryComponent;
  }
}
