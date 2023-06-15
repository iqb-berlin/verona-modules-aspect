import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';

export class GeometryElement extends UIElement implements PositionedUIElement {
  appDefinition: string = '';
  width: number = 600;
  height: number = 400;
  showResetIcon: boolean = true;
  enableUndoRedo: boolean = true;
  showToolbar: boolean = true;
  enableShiftDragZoom: boolean = true;
  showZoomButtons: boolean = true;
  showFullscreenButton: boolean = true;
  customToolbar: string = '';
  position: PositionProperties;

  constructor(element: Partial<GeometryElement>) {
    super(element);
    this.appDefinition = element.appDefinition !== undefined ? element.appDefinition : '';
    this.width = element.width !== undefined ? element.width : 600;
    this.height = element.height !== undefined ? element.height : 400;
    this.showResetIcon = element.showResetIcon !== undefined ? element.showResetIcon : true;
    this.enableUndoRedo = element.enableUndoRedo !== undefined ? element.enableUndoRedo : true;
    this.showToolbar = element.showToolbar !== undefined ? element.showToolbar : true;
    this.enableShiftDragZoom = element.enableShiftDragZoom !== undefined ? element.enableShiftDragZoom : true;
    this.showZoomButtons = element.showZoomButtons !== undefined ? element.showZoomButtons : true;
    this.showFullscreenButton = element.showFullscreenButton !== undefined ? element.showFullscreenButton : true;
    this.customToolbar = element.customToolbar !== undefined ? element.customToolbar : '';

    this.position = UIElement.initPositionProps({ ...element.position });
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'string',
      format: 'ggb-file',
      multiple: false,
      nullable: false,
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return GeometryComponent;
  }
}
