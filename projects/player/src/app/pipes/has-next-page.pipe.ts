import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'hasNextPage'
})
export class HasNextPagePipe implements PipeTransform {
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    return HasNextPagePipe.getNextPageIndex(index, isVisibleIndexPages) !== null;
  }

  static getNextPageIndex(index: number, isVisibleIndexPages: IsVisibleIndex[]): number | null {
    const page = isVisibleIndexPages
      .find(element => element.isVisible && element.index > index);
    return page ? page.index : null;
  }
}
