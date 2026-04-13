import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import {
  UIElement, CompoundElement
} from 'common/models/elements/element';
import {
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
  styling: { backgroundColor: string } & BorderStyles = {
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS.table),
    backgroundColor: ELEMENT_DEFAULTS.table.backgroundColor as string
  };

  static title: string = 'Tabelle';
  static icon: string = 'table_view';

  constructor(element?: Partial<TableProperties>, idService?: AbstractIDService) {
    super({ type: 'table', ...element }, idService);
    if (isTableProperties(element)) {
      this.gridColumnSizes = element.gridColumnSizes;
      this.gridRowSizes = element.gridRowSizes;
      this.elements = element.elements
        .map(el => {
          const newElement = ModelRegistry.createElement(el, idService);
          newElement.gridRow = el.gridRow; // add custom table element params
          newElement.gridColumn = el.gridColumn;
          if (el.type === 'text-field') {
            delete (newElement as Partial<PositionedUIElement>).appearance;
          }
          return newElement;
        }) as PositionedUIElement[];

      this.tableEdgesEnabled = element.tableEdgesEnabled;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
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
}

interface TableProperties extends UIElementProperties {
  gridColumnSizes: { value: number; unit: string }[];
  gridRowSizes: { value: number; unit: string }[];
  elements: UIElement[];
  tableEdgesEnabled: boolean;
  position: PositionProperties;
  styling: { backgroundColor: string } & BorderStyles;
}

function isTableProperties(blueprint?: Partial<TableProperties>): blueprint is TableProperties {
  if (!blueprint) return false;
  return blueprint.gridColumnSizes !== undefined &&
    blueprint.gridRowSizes !== undefined &&
    blueprint.elements !== undefined &&
    blueprint.tableEdgesEnabled !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    blueprint.styling?.backgroundColor !== undefined &&
    PropertyGroupValidators.isValidBorderStyles(blueprint.styling);
}
