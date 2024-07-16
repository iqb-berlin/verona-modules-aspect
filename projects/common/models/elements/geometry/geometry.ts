import { Type } from '@angular/core';
import {
  PositionedUIElement, UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import {
  PositionProperties,
  PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class GeometryElement extends UIElement implements GeometryProperties {
  type: UIElementType = 'geometry';
  appDefinition: string = '';
  trackedVariables: string[] = [];
  showResetIcon: boolean = true;
  enableUndoRedo: boolean = true;
  showToolbar: boolean = true;
  enableShiftDragZoom: boolean = false;
  showZoomButtons: boolean = false;
  showFullscreenButton: boolean = false;
  customToolbar: string = '';
  position: PositionProperties;

  static title: string = 'Geometrie';
  static icon: string = 'architecture';

  constructor(element?: GeometryProperties) {
    super(element);
    if (element && isValid(element)) {
      this.appDefinition = element.appDefinition;
      this.trackedVariables = [...element.trackedVariables];
      this.showResetIcon = element.showResetIcon;
      this.enableUndoRedo = element.enableUndoRedo;
      this.showToolbar = element.showToolbar;
      this.enableShiftDragZoom = element.enableShiftDragZoom;
      this.showZoomButtons = element.showZoomButtons;
      this.showFullscreenButton = element.showFullscreenButton;
      this.customToolbar = element.customToolbar;
      this.position = { ...element.position };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Geometry instantiation', element);
      }
      if (element?.appDefinition !== undefined) this.appDefinition = element.appDefinition;
      if (element?.trackedVariables !== undefined) this.trackedVariables = [...element.trackedVariables];
      if (element?.showResetIcon !== undefined) this.showResetIcon = element.showResetIcon;
      if (element?.enableUndoRedo !== undefined) this.enableUndoRedo = element.enableUndoRedo;
      if (element?.showToolbar !== undefined) this.showToolbar = element.showToolbar;
      if (element?.enableShiftDragZoom !== undefined) this.enableShiftDragZoom = element.enableShiftDragZoom;
      if (element?.showZoomButtons !== undefined) this.showZoomButtons = element.showZoomButtons;
      if (element?.showFullscreenButton !== undefined) this.showFullscreenButton = element.showFullscreenButton;
      if (element?.customToolbar !== undefined) this.customToolbar = element.customToolbar;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        width: 600,
        height: 400,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
    }
  }

  getGeometryVariableId(variableName: string): string {
    return `${this.id}_${variableName}`;
  }

  getVariableInfoOfGeometryVariable(variableName: string): VariableInfo {
    return {
      id: this.getGeometryVariableId(variableName),
      type: 'string',
      format: 'ggb-variable',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    };
  }

  getVariableInfos(): VariableInfo[] {
    const answerSchemes = this.trackedVariables.map(variable => this
      .getVariableInfoOfGeometryVariable(variable));
    answerSchemes.push({
      id: this.id,
      type: 'string',
      format: 'ggb-file',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    });
    return answerSchemes;
  }

  getElementComponent(): Type<ElementComponent> {
    return GeometryComponent;
  }

  getDuplicate(): GeometryElement {
    return new GeometryElement(this);
  }
}

export interface GeometryProperties extends UIElementProperties {
  appDefinition: string;
  trackedVariables: string[];
  showResetIcon: boolean;
  enableUndoRedo: boolean;
  showToolbar: boolean;
  enableShiftDragZoom: boolean;
  showZoomButtons: boolean;
  showFullscreenButton: boolean;
  customToolbar: string;
  position: PositionProperties;
}

function isValid(blueprint?: GeometryProperties): boolean {
  if (!blueprint) return false;
  return blueprint.appDefinition !== undefined &&
    blueprint.trackedVariables !== undefined &&
    blueprint.showResetIcon !== undefined &&
    blueprint.enableUndoRedo !== undefined &&
    blueprint.showToolbar !== undefined &&
    blueprint.enableShiftDragZoom !== undefined &&
    blueprint.showZoomButtons !== undefined &&
    blueprint.showFullscreenButton !== undefined &&
    blueprint.customToolbar !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position);
}
