import packageJSON from '../../../package.json';
import { Page } from 'common/models/page';
import { IDManager } from 'common/util/id-manager';
import { AnswerScheme, UIElement } from 'common/models/elements/element';

export class Unit {
  type = 'aspect-unit-definition';
  version: string;
  pages: Page[] = [];

  constructor(unit?: Partial<Unit>, idManager?: IDManager) {
    this.version = packageJSON.config.unit_definition_version;
    this.pages = unit?.pages?.map(page => new Page(page, idManager)) || [new Page()];
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.pages.map(page => page.getAllElements(elementType)).flat();
  }

  getAnswerScheme(): AnswerScheme[] {
    const dropLists = [
      ...this.getAllElements('drop-list'),
      ...this.getAllElements('drop-list-simple')
    ];
    return this.pages.map(page => page.getAnswerScheme(dropLists)).flat();
  }
}
