import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/classes/unit';

@Pipe({
  name: 'pageIndex'
})
export class PageIndexPipe implements PipeTransform {

  transform(pages: Page[], pageToFind: Page | null): number {
    return pageToFind ? this.getPageIndex(pages, pageToFind) : -1;
  }

  private getPageIndex(pages: Page[], pageToFind: Page): number {
    return pages.findIndex((page: Page): boolean => page === pageToFind);
  }

}
