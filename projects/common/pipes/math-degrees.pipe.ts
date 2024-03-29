import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mathDegrees'
})
export class MathDegreesPipe implements PipeTransform {
  transform(radian: number): number {
    return (radian * 180) / Math.PI;
  }
}
