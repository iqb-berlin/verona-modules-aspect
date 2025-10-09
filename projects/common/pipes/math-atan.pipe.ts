import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'mathAtan',
    standalone: false
})
export class MathAtanPipe implements PipeTransform {
  transform(adjacent: number, opposite: number): number {
    return Math.atan(opposite / adjacent);
  }
}
