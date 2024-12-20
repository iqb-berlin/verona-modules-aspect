import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'areaRowHeight',
  standalone: true
})
export class AreaRowHeightPipe implements PipeTransform {
  transform(rows: number, fontSize: number, lineHeight: number): number {
    // uses ml object for calculating the line height
    const contentHeight = fontSize + ((fontSize / 10) * 2);
    const contentContainerHeight = contentHeight + (2 * 6);
    const mathElementHeight = contentContainerHeight + (2 * 9);
    return mathElementHeight * rows * (lineHeight / 100);
  }
}
