import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from 'common/models/ui-element-interfaces';

@Pipe({
  name: 'measure',
  standalone: false
})
export class MeasurePipe implements PipeTransform {
  /** Sizes with their units as one space-separated string -- `[{value: 20, unit: '%'}, …]` becomes
      `20% …`. Used as a track list for the grid rows and columns of a section or a table, and with a
      one-element array for a single margin. */
  transform(gridSizes: Measurement[]): string {
    return gridSizes.map(size => String(size.value) + size.unit).join(' ');
  }
}
