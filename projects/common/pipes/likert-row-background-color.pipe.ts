import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'LikertRowBackgroundColor',
  standalone: false
})
export class LikertRowBackgroundColorPipe implements PipeTransform {
  /**
   * The background of one statement row of a likert table, by its index among the rows -- the row of
   * column headings above them is not passed through here.
   *
   * The first row is decided on its own setting and takes precedence; from there every second row is
   * coloured, the first one included. A row that is not coloured is transparent, not white.
   */
  transform(lineColoring: boolean, lineColoringColor: string, firstLineColoring: boolean,
            firstLineColoringColor: string, rowIndex: number): string {
    if (rowIndex === 0 && firstLineColoring) return firstLineColoringColor;
    return lineColoring && rowIndex % 2 === 0 ? lineColoringColor : 'transparent';
  }
}
