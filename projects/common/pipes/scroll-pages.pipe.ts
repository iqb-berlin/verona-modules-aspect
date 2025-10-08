import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/models/page';

@Pipe({
    name: 'scrollPages',
    standalone: false
})
export class ScrollPagesPipe implements PipeTransform {
  transform(pages: Page[]): Page[] {
    return pages.filter((page: Page): boolean => !page.alwaysVisible);
  }
}
