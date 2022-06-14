import packageJSON from '../../../package.json';
import { Page } from 'common/models/page';
import { IDManager } from 'common/util/id-manager';
import { UIElement } from 'common/models/elements/element';

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
}
