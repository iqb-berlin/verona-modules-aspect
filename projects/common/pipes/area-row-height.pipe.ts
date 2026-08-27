import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'areaRowHeight',
  standalone: false
})
export class AreaRowHeightPipe implements PipeTransform {
  /**
   * The height in pixels a formula area needs for a given number of rows -- MathLive lays its field out
   * itself, so the room for it has to be worked out rather than measured.
   *
   * The line height is the one the element stores, a percentage rather than a factor, which is what the
   * division by 100 turns it into.
   */
  transform(rows: number, fontSize: number, lineHeight: number): number {
    // uses ml object for calculating the line height
    const contentHeight = fontSize + ((fontSize / 10) * 2);
    const contentContainerHeight = contentHeight + (2 * 6);
    const mathElementHeight = contentContainerHeight + (2 * 9);
    return mathElementHeight * rows * (lineHeight / 100);
  }
}
