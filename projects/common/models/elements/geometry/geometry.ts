import { UIElement } from 'common/models/elements/element';
import {
  PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import {
  AbstractIDService, GeometryVariable, UIElementProperties, UIElementType
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class GeometryElement extends UIElement implements GeometryProperties {
  type: UIElementType = 'geometry';
  appDefinition: string = ELEMENT_DEFAULTS.geometry.appDefinition as string;
  trackedVariables: GeometryVariable[] = ELEMENT_DEFAULTS.geometry.trackedVariables as GeometryVariable[];
  trackedExpectedVariables: GeometryVariable[] =
    ELEMENT_DEFAULTS.geometry.trackedExpectedVariables as GeometryVariable[];

  showResetIcon: boolean = ELEMENT_DEFAULTS.geometry.showResetIcon as boolean;
  enableUndoRedo: boolean = ELEMENT_DEFAULTS.geometry.enableUndoRedo as boolean;
  showToolbar: boolean = ELEMENT_DEFAULTS.geometry.showToolbar as boolean;
  enableShiftDragZoom: boolean = ELEMENT_DEFAULTS.geometry.enableShiftDragZoom as boolean;
  showZoomButtons: boolean = ELEMENT_DEFAULTS.geometry.showZoomButtons as boolean;
  showFullscreenButton: boolean = ELEMENT_DEFAULTS.geometry.showFullscreenButton as boolean;
  customToolbar: string = ELEMENT_DEFAULTS.geometry.customToolbar as string;
  fileName: string = ELEMENT_DEFAULTS.geometry.fileName as string;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.geometry);
  dimensions: {
    width: number;
    height: number;
  } = PropertyGroupGenerators
      .generateDimensionProps(ELEMENT_DEFAULTS.geometry) as { width: number; height: number; };

  static title: string = 'Geometrie';
  static icon: string = 'architecture';

  constructor(element?: Partial<GeometryProperties>, idService?: AbstractIDService) {
    super({ type: 'geometry', ...element }, idService);
    if (isGeometryProperties(element)) {
      this.appDefinition = element.appDefinition;
      this.trackedVariables = [...GeometryElement.sanitizeGeometryVariables(element.trackedVariables)];
      this.trackedExpectedVariables = [...element.trackedExpectedVariables];
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
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Geometry instantiation', element);
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

  getVariableIdentifiers(variableIds: string[]): { id: string, alias: string }[] {
    const trackedVariableIds = this.getAllCleanedTrackedVariables()
      .map(variable => variable.id);
    return [...variableIds, ...trackedVariableIds]
      .map(variableId => {
        const variableName = this.getVariableNameFromAlias(variableId);
        return {
          id: this.getGeometryVariableId(variableName),
          alias: this.getGeometryVariableAlias(variableName)
        };
      });
  }

  getAllCleanedTrackedVariables(): GeometryVariable[] {
    const variablesById = [...this.trackedExpectedVariables, ...this.trackedVariables]
      .reduce<Map<string, GeometryVariable>>((acc, v) => {
      acc.set(v.id, v);
      return acc;
    }, new Map());
    return Array.from(variablesById.values());
  }

  private getVariableNameFromAlias(variableId: string): string {
    return variableId.replace(`${this.alias}_`, '');
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
    const answerSchemes = this.getAllCleanedTrackedVariables().map(variable => this
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
}

export interface GeometryProperties extends UIElementProperties {
  appDefinition: string;
  trackedVariables: GeometryVariable[];
  trackedExpectedVariables: GeometryVariable[];
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
    blueprint.type === 'geometry';
}
