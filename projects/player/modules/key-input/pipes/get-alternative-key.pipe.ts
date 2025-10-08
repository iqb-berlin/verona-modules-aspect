import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getAlternativeKey',
    standalone: false
})
export class GetAlternativeKeyPipe implements PipeTransform {
  transform(key: string, shiftedKey: string, shift: boolean): string | null {
    if (key.toUpperCase() !== shiftedKey) {
      return shift ? key : shiftedKey;
    }
    return null;
  }
}
