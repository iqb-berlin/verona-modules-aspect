import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'updateTextareaRows'
})
export class UpdateTextareaRowsPipe implements PipeTransform {
  transform(expectedCharactersCount: number, inputWidth: number, fontSize: number): number {
    const averageCharWidth = fontSize / 2; // s. AverageCharWidth of dotNet
    return Math.ceil((expectedCharactersCount * averageCharWidth) / inputWidth);
  }
}
