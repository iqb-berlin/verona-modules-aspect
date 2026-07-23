import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from 'common/interfaces';

@Pipe({
  name: 'tableGridRows',
  standalone: false
})
export class TableGridRowsPipe implements PipeTransform {
  transform(gridRowSizes: Measurement[], headerRowCount: number, contentRowHeight: string | null = null): string {
    return [
      ...Array(headerRowCount).fill('auto'),
      ...gridRowSizes.map(size => contentRowHeight ?? String(size.value) + size.unit)
    ].join(' ');
  }
}
