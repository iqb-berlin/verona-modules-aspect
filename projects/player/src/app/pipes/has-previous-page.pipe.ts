import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'hasPreviousPage',
  standalone: false
})
export class HasPreviousPagePipe implements PipeTransform {
  /** Whether a visible page comes before this one -- what decides the "previous page" button. */
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    return HasPreviousPagePipe.getPreviousPageIndex(index, isVisibleIndexPages) !== null;
  }

  /** The index of the previous visible page, or `null` if this is the first one. The nearest one by
      index, whatever order the list is in -- see `HasNextPagePipe.getNextPageIndex` (#1383). */
  static getPreviousPageIndex(index: number, isVisibleIndexPages: IsVisibleIndex[]): number | null {
    const indices = isVisibleIndexPages
      .filter(element => element.isVisible && element.index < index)
      .map(element => element.index);
    return indices.length ? Math.max(...indices) : null;
  }
}
