import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'playerTimeFormat'
})
export class PlayerTimeFormatPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: number = 0): string {
    const minutes: number = Math.floor(value);
    const seconds: number = Math.floor((value - minutes) * 60);
    return `${minutes.toString(10).padStart(2, '0')}:${seconds.toString(10).padStart(2, '0')}`;
  }
}
