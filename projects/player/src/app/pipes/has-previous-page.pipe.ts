import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'hasPreviousPage'
})
export class HasPreviousPagePipe implements PipeTransform {
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    return HasPreviousPagePipe.getPreviousPageIndex(index, isVisibleIndexPages) !== null;
  }

  static getPreviousPageIndex(index: number, isVisibleIndexPages: IsVisibleIndex[]): number | null {
    const pages = isVisibleIndexPages
      .filter(element => element.isVisible && element.index < index);
    return pages.length ? pages[pages.length - 1].index : null;
  }
}
