import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cast',
    standalone: false
})
export class CastPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform<S, T extends S>(value: S, type: T): T {
    return <T>value;
  }
}
