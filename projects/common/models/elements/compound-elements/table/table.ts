import { VariableInfo } from '@iqb/responses';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import {
  UIElement, CompoundElement, isUIElementProperties
} from 'common/models/elements/element';
import {
  BasicStyles,
  BorderStyles, PositionProperties,
  PropertyGroupGenerators,
  PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { ModelRegistry } from 'common/utils/model-registry';
import {
  AbstractIDService,
  PositionedUIElement,
  UIElementProperties,
  UIElementType,
  UIElementValue
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class TableElement extends CompoundElement implements TableProperties {
  type: UIElementType = 'table';
  gridColumnSizes: { value: number; unit: string }[] =
    [...ELEMENT_DEFAULTS.table.gridColumnSizes as { value: number; unit: string }[]];

  gridRowSizes: { value: number; unit: string }[] =
    [...ELEMENT_DEFAULTS.table.gridRowSizes as { value: number; unit: string }[]];

  elements: UIElement[] = [];
  tableEdgesEnabled: boolean = ELEMENT_DEFAULTS.table.tableEdgesEnabled as boolean;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.table);
  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.table),
    backgroundColor: (ELEMENT_DEFAULTS.table as any).backgroundColor as string || '#d3d3d3',
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS.table)
  };

  static title: string = 'Tabelle';
  static icon: string = 'grid_on';

  constructor(element?: Partial<TableProperties>, idService?: AbstractIDService) {
    super({ type: 'table', ...element }, idService);
    if (isTableProperties(element)) {
      this.gridColumnSizes = element.gridColumnSizes;
      this.gridRowSizes = element.gridRowSizes;
      this.elements = element.elements.map(el => {
        const childElement = ModelRegistry.createElement(el, idService);
        // Keep cell coordinates after deserialization so table children can be placed in the grid.
        childElement.gridRow = (el as unknown as Record<string, unknown>).gridRow;
        childElement.gridColumn = (el as unknown as Record<string, unknown>).gridColumn;
        return childElement;
      });
      this.tableEdgesEnabled = element.tableEdgesEnabled;
      this.position = { ...element.position };
      this.styling = { ...element.styling } as BasicStyles & BorderStyles;
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Table instantiation', element);
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    if (property === 'gridColumnSizes' || property === 'gridRowSizes') {
      // Don't preserve original array, so Component gets updated
      this[property] = value as { value: number; unit: string }[];
    } else {
      super.setProperty(property, value);
    }
  }

  getChildElements(): UIElement[] {
    return this.elements;
  }

  getBlueprint(): TableElement {
    return {
      ...this,
      elements: this.elements.map(el => el.getBlueprint()),
      id: undefined,
      alias: undefined
    } as unknown as TableElement;
  }

  getVariableInfos(): VariableInfo[] {
    return this.elements.map(element => element.getVariableInfos())
      .reduce((accumulator, value) => accumulator.concat(value), []);
  }
}

export interface TableProperties extends UIElementProperties {
  gridColumnSizes: { value: number; unit: string }[];
  gridRowSizes: { value: number; unit: string }[];
  elements: UIElementProperties[];
  tableEdgesEnabled: boolean;
  position: PositionProperties;
  styling: BasicStyles & BorderStyles;
}

function isTableProperties(blueprint?: Partial<TableProperties>): blueprint is TableProperties {
  if (!blueprint) return false;
  return blueprint.gridColumnSizes !== undefined &&
    blueprint.gridRowSizes !== undefined &&
    blueprint.elements !== undefined &&
    blueprint.tableEdgesEnabled !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    blueprint.styling?.backgroundColor !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    isUIElementProperties(blueprint);
}
