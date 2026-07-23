import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from 'common/interfaces';

@Pipe({
  name: 'tableGridRows',
  standalone: false
})
export class TableGridRowsPipe implements PipeTransform {
  transform(gridRowSizes: Measurement[], headerRowCount: number): string {
    return [
      ...Array(headerRowCount).fill('auto'),
      ...gridRowSizes.map(size => String(size.value) + size.unit)
    ].join(' ');
  }
}
