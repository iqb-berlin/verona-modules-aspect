import packageJSON from '../../../package.json';
import { Page } from 'common/models/page';
import { UIElement } from 'common/models/elements/element';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';

export class Unit {
  type = 'aspect-unit-definition';
  version: string;
  pages: Page[] = [];

  constructor(unit?: Partial<Unit>) {
    this.version = packageJSON.config.unit_definition_version;
    this.pages = unit?.pages?.map(page => new Page(page)) || [new Page()];
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
