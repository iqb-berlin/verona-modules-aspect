import { UIElement } from 'common/models/elements/element';
import {
  PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { UIElementProperties, UIElementType, FileNameProperties } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class GeometryElement extends UIElement implements GeometryProperties {
  type: UIElementType = 'geometry';
  appDefinition: string = ELEMENT_DEFAULTS.geometry.appDefinition;
  trackedVariables: GeometryVariable[] = ELEMENT_DEFAULTS.geometry.trackedVariables;
  trackedExpectedVariables: GeometryVariable[] =
    ELEMENT_DEFAULTS.geometry.trackedExpectedVariables;

  showResetIcon: boolean = ELEMENT_DEFAULTS.geometry.showResetIcon;
  enableUndoRedo: boolean = ELEMENT_DEFAULTS.geometry.enableUndoRedo;
  showToolbar: boolean = ELEMENT_DEFAULTS.geometry.showToolbar;
  enableShiftDragZoom: boolean = ELEMENT_DEFAULTS.geometry.enableShiftDragZoom;
  showZoomButtons: boolean = ELEMENT_DEFAULTS.geometry.showZoomButtons;
  showFullscreenButton: boolean = ELEMENT_DEFAULTS.geometry.showFullscreenButton;
  customToolbar: string = ELEMENT_DEFAULTS.geometry.customToolbar;
  fileName: string = ELEMENT_DEFAULTS.geometry.fileName;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps();
  dimensions: {
    width: number;
    height: number;
  } = PropertyGroupGenerators
      .generateDimensionProps(ELEMENT_DEFAULTS.geometry.dimensions);

  /* No styling at all: not one of this element's templates reads a styling value, and the group it
     used to get came from the base class rather than from any declaration (#1226). Declared here so
     the merge in the constructor keeps nothing and the inspector offers nothing.

     Deleting this field compiles: the inherited `styling: Stylings` is assignable to the interface's
     optional empty group, because every object is. What holds the emptiness is the spec in
     element.spec.ts, not the type. */
  styling: Record<never, never> = {};

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

export interface GeometryProperties extends UIElementProperties, FileNameProperties {
  /** No styling: see the class field (#1226). */
  styling?: Record<never, never>;
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
