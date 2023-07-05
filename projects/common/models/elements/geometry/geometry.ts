import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';

export class GeometryElement extends UIElement implements PositionedUIElement, GeometryProperties {
  type: UIElementType = 'geometry';
  appDefinition: string;
  showResetIcon: boolean;
  enableUndoRedo: boolean;
  showToolbar: boolean;
  enableShiftDragZoom: boolean;
  showZoomButtons: boolean;
  showFullscreenButton: boolean;
  customToolbar: string;
  position: PositionProperties;

  constructor(element: GeometryProperties) {
    super(element);
    this.appDefinition = element.appDefinition;
    this.showResetIcon = element.showResetIcon;
    this.enableUndoRedo = element.enableUndoRedo;
    this.showToolbar = element.showToolbar;
    this.enableShiftDragZoom = element.enableShiftDragZoom;
    this.showZoomButtons = element.showZoomButtons;
    this.showFullscreenButton = element.showFullscreenButton;
    this.customToolbar = element.customToolbar;
    this.position = element.position;
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

export interface GeometryProperties extends UIElementProperties {
  appDefinition: string;
  showResetIcon: boolean;
  enableUndoRedo: boolean;
  showToolbar: boolean;
  enableShiftDragZoom: boolean;
  showZoomButtons: boolean;
  showFullscreenButton: boolean;
  customToolbar: string;
  position: PositionProperties;
}
