import { Pipe, PipeTransform } from '@angular/core';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';

@Pipe({
  name: 'isValidPage'
})
export class IsValidPagePipe implements PipeTransform {
  transform(index: number, isVisibleIndexPages: IsVisibleIndex[]): boolean {
    if (!isVisibleIndexPages) return false;
    return !!isVisibleIndexPages.find(element => element.index === index && element.isVisible);
  }
}
