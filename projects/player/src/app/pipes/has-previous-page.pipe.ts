import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'hasPreviousPage',
  standalone: false
})
export class HasPreviousPagePipe implements PipeTransform {
  /**
   * Whether a visible page comes before this one -- what decides the "previous page" button.
   *
   * Sorts the list it is given, in place, and that list belongs to the component (#1383). The static
   * `getPreviousPageIndex` relies on the sorted order and is called elsewhere without sorting first.
   */
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    isVisibleIndexPages.sort((a, b) => a.index - b.index);
    return HasPreviousPagePipe.getPreviousPageIndex(index, isVisibleIndexPages) !== null;
  }

  /** The index of the previous visible page, or `null` if this is the first one. Expects the list
      sorted by index -- it takes the last entry below `index`, not the largest. */
  static getPreviousPageIndex(index: number, isVisibleIndexPages: IsVisibleIndex[]): number | null {
    const pages = isVisibleIndexPages
      .filter(element => element.isVisible && element.index < index);
    return pages.length ? pages[pages.length - 1].index : null;
  }
}
