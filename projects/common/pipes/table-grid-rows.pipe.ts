import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from 'common/models/ui-element-interfaces';

@Pipe({
  name: 'tableGridRows',
  standalone: false
})
export class TableGridRowsPipe implements PipeTransform {
  /**
   * The `grid-template-rows` of a table: every header row as `auto`, so it takes the height its content
   * needs, and the content rows in the sizes the element stores. A given `contentRowHeight` overrides
   * all of the stored sizes at once, which is how a table with a uniform row height is drawn.
   */
  transform(gridRowSizes: Measurement[], headerRowCount: number, contentRowHeight: string | null = null): string {
    return [
      ...Array(headerRowCount).fill('auto'),
      ...gridRowSizes.map(size => contentRowHeight ?? String(size.value) + size.unit)
    ].join(' ');
  }
}
