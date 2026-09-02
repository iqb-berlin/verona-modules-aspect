import { Pipe, PipeTransform } from '@angular/core';
import { Page } from 'common/models/page';

@Pipe({
  name: 'alwaysVisiblePage',
  standalone: false
})
export class AlwaysVisiblePagePipe implements PipeTransform {
  /** The page that stays on screen beside all the others, or `null` if the unit has none. Only the
      first such page is found; a unit is not expected to have two. */
  transform(pages: Page[]): Page | null {
    return AlwaysVisiblePagePipe.getAlwaysVisiblePage(pages);
  }

  private static getAlwaysVisiblePage(pages: Page[]): Page | null {
    return pages.find((page: Page): boolean => page.alwaysVisible) || null;
  }
}
