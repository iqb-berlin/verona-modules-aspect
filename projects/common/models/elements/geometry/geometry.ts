import { Type } from '@angular/core';
import {
  UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import {
  PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import {
  AbstractIDService, GeometryVariable, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class GeometryElement extends UIElement implements GeometryProperties {
  type: UIElementType = 'geometry';
  appDefinition: string = '';
  trackedVariables: GeometryVariable[] = [];
  showResetIcon: boolean = true;
  enableUndoRedo: boolean = true;
  showToolbar: boolean = true;
  enableShiftDragZoom: boolean = false;
  showZoomButtons: boolean = false;
  showFullscreenButton: boolean = false;
  customToolbar: string = '';
  fileName: string = '';
  position: PositionProperties;
  dimensions: {
    width: number;
    height: number;
  };

  static title: string = 'Geometrie';
  static icon: string = 'architecture';

  constructor(element?: Partial<GeometryProperties>, idService?: AbstractIDService) {
    super({ type: 'geometry', ...element }, idService);
    if (isGeometryProperties(element)) {
      this.appDefinition = element.appDefinition;
      this.trackedVariables = [...GeometryElement.sanitizeGeometryVariables(element.trackedVariables)];
      this.showResetIcon = element.showResetIcon;
      this.enableUndoRedo = element.enableUndoRedo;
      this.showToolbar = element.showToolbar;
      this.enableShiftDragZoom = element.enableShiftDragZoom;
      this.showZoomButtons = element.showZoomButtons;
      this.showFullscreenButton = element.showFullscreenButton;
      this.customToolbar = element.customToolbar;
      this.fileName = element.fileName;
      this.position = { ...element.position };
      this.dimensions = { ...element.dimensions };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Geometry instantiation', element);
      }
      if (element?.appDefinition !== undefined) this.appDefinition = element.appDefinition;
      if (element?.trackedVariables !== undefined) {
        this.trackedVariables = [...GeometryElement.sanitizeGeometryVariables(element.trackedVariables)];
      }
      if (element?.showResetIcon !== undefined) this.showResetIcon = element.showResetIcon;
      if (element?.enableUndoRedo !== undefined) this.enableUndoRedo = element.enableUndoRedo;
      if (element?.showToolbar !== undefined) this.showToolbar = element.showToolbar;
      if (element?.enableShiftDragZoom !== undefined) this.enableShiftDragZoom = element.enableShiftDragZoom;
      if (element?.showZoomButtons !== undefined) this.showZoomButtons = element.showZoomButtons;
      if (element?.showFullscreenButton !== undefined) this.showFullscreenButton = element.showFullscreenButton;
      if (element?.customToolbar !== undefined) this.customToolbar = element.customToolbar;
      if (element?.fileName !== undefined) this.fileName = element.fileName;
      this.dimensions = {
        width: 600,
        height: 400,
        ...element?.dimensions
      };
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
    }
  }

  private static sanitizeGeometryVariables(variables: GeometryVariable[] | string[]): GeometryVariable[] {
    const isStringArray = (arr: unknown[]): arr is string[] => Array
      .isArray(arr) && arr.length > 0 && arr.every(item => typeof item === 'string');
    if (!Array.isArray(variables) || variables.length === 0) return [];
    if (isStringArray(variables)) return variables.map(variable => ({ id: variable, value: '' }));
    return variables;
  }

  getGeometryVariableId(variableName: string): string {
    return `${this.id}_${variableName}`;
  }

  getGeometryVariableAlias(variableName: string): string {
    return `${this.alias}_${variableName}`;
  }

  getIdentifiers(): { id: string, alias: string }[] {
    return [
      { id: this.id, alias: this.alias },
      ...this.trackedVariables
        .map(variable => ({
          id: this.getGeometryVariableId(variable.id),
          alias: this.getGeometryVariableAlias(variable.id)
        }))];
  }

  getVariableInfoOfGeometryVariable(variableName: string): VariableInfo {
    return {
      id: this.getGeometryVariableId(variableName),
      alias: this.getGeometryVariableAlias(variableName),
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
      .getVariableInfoOfGeometryVariable(variable.id));
    answerSchemes.push({
      id: this.id,
      alias: this.alias,
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
}

export interface GeometryProperties extends UIElementProperties {
  appDefinition: string;
  trackedVariables: GeometryVariable[];
  showResetIcon: boolean;
  enableUndoRedo: boolean;
  showToolbar: boolean;
  enableShiftDragZoom: boolean;
  showZoomButtons: boolean;
  showFullscreenButton: boolean;
  customToolbar: string;
  fileName: string;
  position: PositionProperties;
  dimensions: {
    width: number;
    height: number;
  };
}

function isGeometryProperties(blueprint?: Partial<GeometryProperties>): blueprint is GeometryProperties {
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
    blueprint.dimensions !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position);
}
