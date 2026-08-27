import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/models/page';

@Pipe({
  name: 'scrollPages',
  standalone: false
})
export class ScrollPagesPipe implements PipeTransform {
  /** The pages that take part in page turning: everything except the always-visible page, which is
      shown beside the others rather than among them. */
  transform(pages: Page[]): Page[] {
    return pages.filter((page: Page): boolean => !page.alwaysVisible);
  }
}
