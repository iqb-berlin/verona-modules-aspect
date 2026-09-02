import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'hasNextPage',
  standalone: false
})
export class HasNextPagePipe implements PipeTransform {
  /** Whether a visible page follows this one -- what decides the "next page" button. */
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    return HasNextPagePipe.getNextPageIndex(index, isVisibleIndexPages) !== null;
  }

  /** The index of the next visible page, or `null` if this is the last one. The nearest one by index,
      whatever order the list is in: the pages report their visibility as they are initialised, and a
      page whose section carries a visibility rule reports one tick earlier than a page without one
      (#1383). */
  static getNextPageIndex(index: number, isVisibleIndexPages: IsVisibleIndex[]): number | null {
    const indices = isVisibleIndexPages
      .filter(element => element.isVisible && element.index > index)
      .map(element => element.index);
    return indices.length ? Math.min(...indices) : null;
  }
}
