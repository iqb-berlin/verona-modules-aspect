import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import {
  UIElement, CompoundElement
} from 'common/models/elements/element';
import {
  BasicStyles,
  BorderStyles,
  DimensionProperties,
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { ModelRegistry } from 'common/utils/model-registry';
import { AbstractIDService } from 'common/models/id-interfaces';
import {
  UIElementProperties, UIElementType, UIElementValue, StickyHeaderProperties
} from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

export class TableElement extends CompoundElement implements TableProperties {
  type: UIElementType = 'table';
  gridColumnSizes: { value: number; unit: string }[] =
    [...ELEMENT_DEFAULTS.table.gridColumnSizes];

  gridRowSizes: { value: number; unit: string }[] =
    [...ELEMENT_DEFAULTS.table.gridRowSizes];

  elements: UIElement[] = [];
  tableEdgesEnabled: boolean = ELEMENT_DEFAULTS.table.tableEdgesEnabled;
  headerEnabled: boolean = ELEMENT_DEFAULTS.table.headerEnabled;
  headerRows: TableHeaderCell[][] = [];
  stickyHeader: boolean = ELEMENT_DEFAULTS.table.stickyHeader;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.table.position);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.table.dimensions);

  styling: BasicStyles & BorderStyles = {
    ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.table.styling),
    ...PropertyGroupGenerators.generateBorderStylingProps(ELEMENT_DEFAULTS.table.styling)
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
        const row = (el as unknown as { gridRow?: number }).gridRow;
        const column = (el as unknown as { gridColumn?: number }).gridColumn;
        if (row !== undefined) childElement.gridRow = row;
        if (column !== undefined) childElement.gridColumn = column;
        return childElement;
      });
      this.tableEdgesEnabled = element.tableEdgesEnabled;
      if (element.headerEnabled !== undefined) this.headerEnabled = element.headerEnabled;
      if (element.headerRows !== undefined) {
        this.headerRows = element.headerRows.map(row => row.map(cell => ({ ...cell })));
      }
      if (element.stickyHeader !== undefined) this.stickyHeader = element.stickyHeader;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
      this.styling = PropertyGroupGenerators.mergeStyling(this.styling, element.styling);
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Table instantiation', element);
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    if (property === 'gridColumnSizes' || property === 'gridRowSizes') {
      // Don't preserve original array, so Component gets updated
      this[property] = value as { value: number; unit: string }[];
      if (property === 'gridColumnSizes') this.adjustHeaderRowsToColumnCount();
    } else if (property === 'headerRows') {
      // Don't preserve original arrays, so Component gets updated
      this.headerRows = (value as TableHeaderCell[][]).map(row => row.map(cell => ({ ...cell })));
    } else if (property === 'headerEnabled') {
      this.headerEnabled = value as boolean;
      if (this.headerEnabled && this.headerRows.length === 0) {
        this.headerRows = [TableElement.createHeaderRow(this.gridColumnSizes.length)];
      }
    } else {
      super.setProperty(property, value);
    }
  }

  addHeaderRow(): void {
    this.headerRows = [...this.headerRows, TableElement.createHeaderRow(this.gridColumnSizes.length)];
  }

  removeHeaderRow(rowIndex: number): void {
    this.headerRows = this.headerRows.filter((_, index) => index !== rowIndex);
  }

  private adjustHeaderRowsToColumnCount(): void {
    const columnCount = this.gridColumnSizes.length;
    this.headerRows = this.headerRows.map(row => [
      ...row.slice(0, columnCount).map(cell => ({ ...cell })),
      ...TableElement.createHeaderRow(Math.max(columnCount - row.length, 0))
    ]);
  }

  private static createHeaderRow(columnCount: number): TableHeaderCell[] {
    return Array.from({ length: columnCount }, (): TableHeaderCell => ({ text: '', alignment: 'left' }));
  }

  getChildElements(): UIElement[] {
    return this.elements;
  }

  /* Only for the return type: the deep copy, including turning the child elements into blueprints of
     their own, is the base class's since #1179. */
  getBlueprint(): TableElement {
    return super.getBlueprint() as unknown as TableElement;
  }
}

export interface TableHeaderCell {
  text: string;
  alignment: 'left' | 'center' | 'right';
}

export interface TableProperties extends UIElementProperties, StickyHeaderProperties {
  gridColumnSizes: { value: number; unit: string }[];
  gridRowSizes: { value: number; unit: string }[];
  elements: UIElementProperties[];
  tableEdgesEnabled: boolean;
  headerEnabled: boolean;
  headerRows: TableHeaderCell[][];
  position: PositionProperties;
  styling: BasicStyles & BorderStyles;
}

function isTableProperties(blueprint?: Partial<TableProperties>): blueprint is TableProperties {
  if (!blueprint) return false;
  return blueprint.elements !== undefined &&
    blueprint.type === 'table';
}
