import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split',
  standalone: false
})
export class SplitPipe implements PipeTransform {
  transform(value: string | null | undefined, separator: string = ' '): string[] {
    if (!value) {
      return [];
    }
    return value.split(separator).filter(item => item.trim() !== '');
  }
}
