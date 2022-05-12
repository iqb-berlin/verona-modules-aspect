import packageJSON from '../../../package.json';
import { Page } from 'common/models/page';

export class Unit {
  type = 'aspect-unit-definition';
  version: string;
  pages: Page[] = [];

  constructor(unit?: Unit) {
    this.version = packageJSON.config.unit_definition_version;
    this.pages = unit?.pages.map(page => new Page(page)) || [new Page()];
  }
}
