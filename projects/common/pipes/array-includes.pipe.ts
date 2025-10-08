import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arrayIncludes',
    standalone: false
})
export class ArrayIncludesPipe implements PipeTransform {
  transform(valueList: string[], searchValue: string): boolean {
    return valueList.includes(searchValue);
  }
}
