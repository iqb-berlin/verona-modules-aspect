import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'LikertRowBackgroundColor',
  standalone: false
})
export class LikertRowBackgroundColorPipe implements PipeTransform {
  transform(lineColoring: boolean, lineColoringColor: string, firstLineColoring: boolean,
            firstLineColoringColor: string, rowIndex: number): string {
    if (rowIndex === 0 && firstLineColoring) return firstLineColoringColor;
    return lineColoring && rowIndex % 2 === 0 ? lineColoringColor : 'transparent';
  }
}
