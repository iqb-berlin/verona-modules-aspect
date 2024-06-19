import {
  CompoundElement,
  PositionedUIElement,
  UIElement,
  UIElementValue,
  Measurement
} from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { VisibilityRule } from 'common/models/visibility-rule';
import { ElementFactory } from 'common/util/element.factory';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

export class Section {
  [index: string]: unknown;
  elements: PositionedUIElement[] = [];
  height: number = 400;
  backgroundColor: string = '#ffffff';
  dynamicPositioning: boolean = true;
  autoColumnSize: boolean = true;
  autoRowSize: boolean = true;
  gridColumnSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }];
  gridRowSizes: { value: number; unit: string }[] = [{ value: 1, unit: 'fr' }];
  visibilityDelay: number = 0;
  animatedVisibility: boolean = false;
  enableReHide: boolean = false;
  logicalConnectiveOfRules: 'disjunction' | 'conjunction' = 'disjunction';
  visibilityRules: VisibilityRule[] = [];
  ignoreNumbering: boolean = false;

  constructor(section?: SectionProperties) {
    if (section && isValid(section)) {
      this.height = section.height;
      this.backgroundColor = section.backgroundColor;
      this.dynamicPositioning = section.dynamicPositioning;
      this.autoColumnSize = section.autoColumnSize;
      this.autoRowSize = section.autoRowSize;
      this.gridColumnSizes = [...section.gridColumnSizes];
      this.gridRowSizes = [...section.gridRowSizes];
      this.visibilityDelay = section.visibilityDelay;
      this.animatedVisibility = section.animatedVisibility;
      this.enableReHide = section.enableReHide;
      this.logicalConnectiveOfRules = section.logicalConnectiveOfRules;
      this.visibilityRules = section.visibilityRules.map(rule => ({ ...rule }));
      this.elements = section.elements
        .map(element => ElementFactory.createElement(element)) as PositionedUIElement[];
      this.ignoreNumbering = section.ignoreNumbering;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Section instantiation');
      }
      if (section?.height !== undefined) this.height = section.height;
      if (section?.backgroundColor !== undefined) this.backgroundColor = section.backgroundColor;
      if (section?.dynamicPositioning !== undefined) this.dynamicPositioning = section.dynamicPositioning;
      if (section?.autoColumnSize !== undefined) this.autoColumnSize = section.autoColumnSize;
      if (section?.autoRowSize !== undefined) this.autoRowSize = section.autoRowSize;
      if (section?.gridColumnSizes !== undefined) this.gridColumnSizes = [...section.gridColumnSizes];
      if (section?.gridRowSizes !== undefined) this.gridRowSizes = [...section.gridRowSizes];
      if (section?.visibilityDelay !== undefined) this.visibilityDelay = section.visibilityDelay;
      if (section?.animatedVisibility !== undefined) this.animatedVisibility = section.animatedVisibility;
      if (section?.enableReHide !== undefined) this.enableReHide = section.enableReHide;
      if (section?.logicalConnectiveOfRules !== undefined) this.logicalConnectiveOfRules = section.logicalConnectiveOfRules;
      if (section?.visibilityRules !== undefined) this.visibilityRules = section.visibilityRules.map(rule => ({ ...rule }));
      this.elements = section?.elements !== undefined ?
        section.elements.map(element => ElementFactory.createElement(element)) as PositionedUIElement[] :
        [];
      if (section?.ignoreNumbering !== undefined) this.ignoreNumbering = section.ignoreNumbering;
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    this[property] = value;
  }

  addElement(element: PositionedUIElement): void {
    this.elements.push(element);
  }

  deleteElement(id: string): void {
    this.elements = this.elements.filter(el => el.id !== id);
  }

  /* Includes children of children, i.e. compound children. */
  getAllElements(elementType?: string): UIElement[] {
    let allElements: UIElement[] =
      this.elements.map(element => [element, ...(element as CompoundElement).getChildElements() || []])
        .flat();
    if (elementType) {
      allElements = allElements.filter(element => element.type === elementType);
    }
    return allElements;
  }

  getVariableInfos(dropLists: DropListElement[]): VariableInfo[] {
    return this.getAllElements()
      .map(element => ((element.type === 'drop-list') ?
        element.getVariableInfos(dropLists) :
        element.getVariableInfos()))
      .flat();
  }
}

export interface SectionProperties {
  elements: PositionedUIElement[];
  height: number;
  backgroundColor: string;
  dynamicPositioning: boolean;
  autoColumnSize: boolean;
  autoRowSize: boolean;
  gridColumnSizes: { value: number; unit: string }[];
  gridRowSizes: Measurement[];
  visibilityDelay: number;
  animatedVisibility: boolean;
  enableReHide: boolean;
  logicalConnectiveOfRules: 'disjunction' | 'conjunction';
  visibilityRules: VisibilityRule[];
  ignoreNumbering: boolean;
}

function isValid(blueprint?: SectionProperties): boolean {
  if (!blueprint) return false;
  return blueprint.elements !== undefined &&
    blueprint.height !== undefined &&
    blueprint.backgroundColor !== undefined &&
    blueprint.dynamicPositioning !== undefined &&
    blueprint.autoColumnSize !== undefined &&
    blueprint.autoRowSize !== undefined &&
    blueprint.gridColumnSizes !== undefined &&
    blueprint.gridRowSizes !== undefined &&
    blueprint.visibilityDelay !== undefined &&
    blueprint.animatedVisibility !== undefined &&
    blueprint.enableReHide !== undefined &&
    blueprint.logicalConnectiveOfRules !== undefined &&
    blueprint.visibilityRules !== undefined &&
    blueprint.ignoreNumbering !== undefined;
}
