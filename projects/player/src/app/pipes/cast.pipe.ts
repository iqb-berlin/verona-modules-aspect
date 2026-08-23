import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cast',
  standalone: false
})
export class CastPipe implements PipeTransform {
  // The type argument is what the template passes to pin T; only its type is used.
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  transform<S, T extends S>(value: S, type: T): T {
    return <T>value;
  }
}
