import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/models/page';

@Pipe({
    name: 'alwaysVisiblePage',
    standalone: false
})
export class AlwaysVisiblePagePipe implements PipeTransform {

  transform(pages: Page[]): Page | null {
    return this.getAlwaysVisiblePage(pages);
  }

  private getAlwaysVisiblePage(pages: Page[]): Page | null {
    return pages.find((page: Page): boolean => page.alwaysVisible) || null;
  }
}
