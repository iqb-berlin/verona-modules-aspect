import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/classes/unit';

@Pipe({
  name: 'scrollPages'
})
export class ScrollPagesPipe implements PipeTransform {

  transform(pages: Page[]): Page[] {
    return this.getScrollPages(pages);
  }

  private getScrollPages(pages: Page[]): Page[] {
    return pages.filter((page: Page): boolean => !page.alwaysVisible);
  }
}
