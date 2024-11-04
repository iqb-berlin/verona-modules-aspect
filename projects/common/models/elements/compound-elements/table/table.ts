import {
  UIElement, CompoundElement
} from 'common/models/elements/element';
import {
  BorderStyles, PositionProperties,
  PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { environment } from 'common/environment';
import { TableComponent } from 'common/components/compound-elements/table/table.component';
import { ElementFactory } from 'common/util/element.factory';
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
  gridColumnSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
  gridRowSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
  elements: UIElement[] = [];
  tableEdgesEnabled: boolean = false;
  position: PositionProperties;
  styling: { backgroundColor: string } & BorderStyles;

  static title: string = 'Tabelle';
  static icon: string = 'table_view';

  constructor(element?: Partial<TableProperties>, idService?: AbstractIDService) {
    super({ type: 'table', ...element }, idService);
    if (isTableProperties(element)) {
      this.gridColumnSizes = element.gridColumnSizes;
      this.gridRowSizes = element.gridRowSizes;
      this.elements = element.elements
        .map(el => {
          const newElement = ElementFactory.createElement(el, idService);
          newElement.gridRow = el.gridRow; // add custom table element params
          newElement.gridColumn = el.gridColumn;
          if (el.type === 'text-field') {
            delete newElement.appearance;
          }
          return newElement;
        }) as PositionedUIElement[];

      this.tableEdgesEnabled = element.tableEdgesEnabled;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Cloze instantiation', element);
      }
      if (element?.gridColumnSizes !== undefined) this.gridColumnSizes = element.gridColumnSizes;
      if (element?.gridRowSizes !== undefined) this.gridRowSizes = element.gridRowSizes;
      this.elements = element?.elements !== undefined ?
        element.elements.map(el => ElementFactory.createElement(el, idService)) as PositionedUIElement[] :
        [];
      if (element?.tableEdgesEnabled !== undefined) this.tableEdgesEnabled = element.tableEdgesEnabled;
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 30, unit: 'px' },
        ...element?.position
      });
      this.styling = {
        backgroundColor: 'transparent',
        ...PropertyGroupGenerators.generateBorderStylingProps({
          borderWidth: 1,
          ...element?.styling
        }),
        ...element?.styling
      };
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    // Don't preserve original array, so Component gets updated
    this[property] = value;
  }

  getElementComponent(): Type<ElementComponent> {
    return TableComponent;
  }

  getDuplicate(): UIElement {
    return new TableElement(this);
  }

  getChildElements(): UIElement[] {
    return this.elements;
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
