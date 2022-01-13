import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mark'
})
/* This extracts marks from an item and puts them is a list to be searchable.
  Only used in cloze component */
export class MarkPipe implements PipeTransform {
  transform(items: any[]): any[] {
    if (!items) {
      return items;
    }
    return items.map(item => item.type);
  }
}
