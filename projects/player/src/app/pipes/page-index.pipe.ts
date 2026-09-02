import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/models/page';

@Pipe({
  name: 'pageIndex',
  standalone: false
})
export class PageIndexPipe implements PipeTransform {
  /** Where a page sits in the list, compared by identity rather than by content, and `-1` for no page
      or one that is not in the list. */
  transform(pages: Page[], pageToFind: Page | null): number {
    return pageToFind ? PageIndexPipe.getPageIndex(pages, pageToFind) : -1;
  }

  private static getPageIndex(pages: Page[], pageToFind: Page): number {
    return pages.findIndex((page: Page): boolean => page === pageToFind);
  }
}
