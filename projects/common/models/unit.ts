import { Page } from './page';
import { moveArrayItem } from '../util/array';
import { ImportedModuleVersion } from '../classes/importedModuleVersion';

export const EXPORTED_MODULE_VERSION = 'iqb-aspect-definition@1.1.0';

export class Unit {
  unitDefinitionType = EXPORTED_MODULE_VERSION;
  pages: Page[] = [];

  constructor(serializedUnit?: Partial<Unit>) {
    ImportedModuleVersion.setVersion(serializedUnit?.unitDefinitionType);
    if (serializedUnit?.pages && serializedUnit.pages.length > 0) {
      serializedUnit?.pages.forEach((page: Page) => {
        this.pages.push(new Page(page));
      });
    } else {
      this.pages.push(new Page());
    }
    ImportedModuleVersion.unitLoaded = true;
  }

  addPage(page?: Page): void {
    page ? this.pages.push(page) : this.pages.push(new Page());
  }

  deletePage(page: Page): void {
    this.pages.splice(this.pages.indexOf(page), 1);
  }

  movePage(selectedPage: Page, direction: 'up' | 'down'): void {
    if (direction === 'up' &&
      this.pages.indexOf(selectedPage) === 1 &&
      this.pages[0].alwaysVisible) {
      return;
    }
    moveArrayItem(selectedPage, this.pages, direction);
  }

  // Make page first element in page array
  movePageToTop(pageIndex: number, page: Page): void {
    this.pages.splice(pageIndex, 1);
    this.pages.splice(0, 0, page);
  }
}
