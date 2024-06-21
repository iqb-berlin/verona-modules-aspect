import {
  UIElement, CompoundElement, PositionedUIElement,
  UIElementProperties, UIElementType, UIElementValue
} from 'common/models/elements/element';
import {
  BasicStyles, BorderStyles, PositionProperties,
  PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { InstantiationEror } from 'common/util/errors';
import { environment } from 'common/environment';
import { TableComponent } from 'common/components/compound-elements/table/table.component';
import { ElementFactory } from 'common/util/element.factory';

export class TableElement extends CompoundElement implements PositionedUIElement, TableProperties {
  type: UIElementType = 'table';
  gridColumnSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
  gridRowSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
  elements: PositionedUIElement[] = [];
  tableEdgesEnabled: boolean = false;
  position: PositionProperties;
  styling: BasicStyles & BorderStyles;

  static title: string = 'Tabelle';
  static icon: string = 'table_view';

  constructor(element?: TableProperties) {
    super(element);
    if (element && isValid(element)) {
      this.gridColumnSizes = element.gridColumnSizes;
      this.gridRowSizes = element.gridRowSizes;
      this.elements = element.elements
        .map(el => ElementFactory.createElement(el)) as PositionedUIElement[];
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
        element.elements.map(el => ElementFactory.createElement(el)) as PositionedUIElement[] :
        [];
      if (element?.tableEdgesEnabled !== undefined) this.tableEdgesEnabled = element.tableEdgesEnabled;
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        ...PropertyGroupGenerators.generateBorderStylingProps({
          borderWidth: 1,
          ...element?.styling
        })
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

export interface TableProperties extends UIElementProperties {
  gridColumnSizes: { value: number; unit: string }[];
  gridRowSizes: { value: number; unit: string }[];
  elements: UIElement[];
  tableEdgesEnabled: boolean;
  position: PositionProperties;
  styling: BasicStyles & BorderStyles;
}

function isValid(blueprint?: TableProperties): boolean {
  if (!blueprint) return false;
  return blueprint.gridColumnSizes !== undefined &&
    blueprint. gridRowSizes !== undefined &&
    blueprint.elements !== undefined &&
    blueprint.tableEdgesEnabled !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling);
}
