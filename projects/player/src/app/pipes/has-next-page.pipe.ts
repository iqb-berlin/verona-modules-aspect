import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'hasNextPage',
  standalone: false
})
export class HasNextPagePipe implements PipeTransform {
  /**
   * Whether a visible page follows this one -- what decides the "next page" button.
   *
   * Sorts the list it is given, in place, and that list belongs to the component (#1383). The static
   * `getNextPageIndex` relies on the sorted order and is called elsewhere without sorting first.
   */
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    isVisibleIndexPages.sort((a, b) => a.index - b.index);
    return HasNextPagePipe.getNextPageIndex(index, isVisibleIndexPages) !== null;
  }

  /** The index of the next visible page, or `null` if this is the last one. Expects the list sorted by
      index -- it takes the first entry above `index`, not the smallest. */
  static getNextPageIndex(index: number, isVisibleIndexPages: IsVisibleIndex[]): number | null {
    const page = isVisibleIndexPages
      .find(element => element.isVisible && element.index > index);
    return page ? page.index : null;
  }
}
