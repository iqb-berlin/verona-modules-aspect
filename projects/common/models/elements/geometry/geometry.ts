import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
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
  customToolBar: string = '';
  position: PositionProperties;

  constructor(element: Partial<GeometryElement>) {
    super(element);
    this.appDefinition = element.appDefinition !== undefined ? element.appDefinition : '';
    this.width = element.width !== undefined ? element.width : 600;
    this.height = element.height !== undefined ? element.height : 400;
    this.showResetIcon = element.showResetIcon !== undefined ? element.showResetIcon : true;
    this.showToolbar = element.showToolbar !== undefined ? element.showToolbar : true;
    this.enableShiftDragZoom = element.enableShiftDragZoom !== undefined ? element.enableShiftDragZoom : true;
    this.showZoomButtons = element.showZoomButtons !== undefined ? element.showZoomButtons : true;
    this.showFullscreenButton = element.showFullscreenButton !== undefined ? element.showFullscreenButton : true;
    this.customToolBar = element.customToolBar !== undefined ? element.customToolBar : '';

    this.position = ElementFactory.initPositionProps({ ...element.position });
  }

  getElementComponent(): Type<ElementComponent> {
    return GeometryComponent;
  }
}
