import { Pipe, PipeTransform } from '@angular/core';
import { Measurement } from 'common/models/elements/element';

@Pipe({
  name: 'measure',
  standalone: true
})
export class MeasurePipe implements PipeTransform {
  transform(gridSizes: Measurement[]): string {
    return gridSizes.map(size => String(size.value) + size.unit).join(' ');
  }
}
