import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split',
  standalone: false
})
export class SplitPipe implements PipeTransform {
  /** Splits a string, by spaces unless told otherwise, and drops the empty pieces -- so repeated or
      trailing separators do not produce blank entries. Nothing in yields an empty list. */
  transform(value: string | null | undefined, separator: string = ' '): string[] {
    if (!value) {
      return [];
    }
    return value.split(separator).filter(item => item.trim() !== '');
  }
}
