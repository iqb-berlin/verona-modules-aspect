import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cast'
})
export class CastPipe implements PipeTransform {
  transform = <S, T extends S>(value: S, type: T): T => <T>value;
}
