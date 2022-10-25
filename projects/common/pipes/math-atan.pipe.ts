import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mathAtan'
})
export class MathAtanPipe implements PipeTransform {
  transform(adjacent: number, opposite: number): number {
    return Math.atan(opposite / adjacent);
  }
}
