import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'isValidPage',
  standalone: false
})
export class IsValidPagePipe implements PipeTransform {
  /** Whether the page at this index is one the reader may see -- a page can be hidden by a visibility
      rule. An index the list does not know is not valid. */
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    return !!isVisibleIndexPages.find(element => element.index === index && element.isVisible);
  }
}
