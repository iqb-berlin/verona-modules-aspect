import { Page } from 'common/models/page';
import { UIElement } from 'common/models/elements/element';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { StateVariable } from 'common/models/state-variable';
import packageJSON from '../../../package.json';

export class Unit implements UnitProperties {
  type = 'aspect-unit-definition';
  version: string;
  pages: Page[];

  constructor(unit: UnitProperties) {
    this.version = unit.version;
    this.stateVariables = unit.stateVariables;
    this.pages = unit.pages.map(page => new Page(page));
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.pages.map(page => page.getAllElements(elementType)).flat();
  }

  getAnswerScheme(): AnswerScheme[] {
    const dropLists = [
      ...this.getAllElements('drop-list')
    ];
    return this.pages.map(page => page.getAnswerScheme(dropLists)).flat();
  }
}

export interface UnitProperties {
  type: string;
  version: string;
  pages: Page[];
}
