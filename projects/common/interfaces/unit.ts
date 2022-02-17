import { PositionedElement } from './elements';

export interface Unit {
  unitDefinitionType: string;
  pages: Page[];
}

export interface Page {
  [index: string]: string | number | boolean | Section[] | undefined;
  sections: Section[];
  hasMaxWidth: boolean;
  maxWidth: number;
  margin: number;
  backgroundColor: string;
  alwaysVisible: boolean;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom';
  alwaysVisibleAspectRatio: number;
}

export interface Section {
  [index: string]: string | number | boolean | PositionedElement[] | undefined;
  elements: PositionedElement[];
  height: number;
  backgroundColor: string;
  dynamicPositioning: boolean;
  autoColumnSize: boolean;
  autoRowSize: boolean;
  gridColumnSizes: string;
  gridRowSizes: string;
}
