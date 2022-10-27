import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'updateTextareaRows'
})
export class UpdateTextareaRowsPipe implements PipeTransform {
  transform(staticRowCount: number,
            expectedCharactersCount: number,
            hasDynamicRowCount: boolean,
            inputWidth: number,
            fontSize: number
  ): number {
    if (hasDynamicRowCount && expectedCharactersCount && inputWidth) {
      const averageCharWidth = fontSize / 2; // s. AverageCharWidth of dotNet
      return (Math.ceil((expectedCharactersCount * averageCharWidth) / inputWidth));
    }
    return staticRowCount;
  }
}
