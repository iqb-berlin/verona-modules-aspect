import packageJSON from '../../../package.json';
import { Page } from 'common/models/page';
import { IDManager } from 'common/util/id-manager';

export class Unit {
  type = 'aspect-unit-definition';
  version: string;
  pages: Page[] = [];

  constructor(unit?: Unit, idManager?: IDManager) {
    this.version = packageJSON.config.unit_definition_version;
    this.pages = unit?.pages.map(page => new Page(page, idManager)) || [new Page()];
  }
}
