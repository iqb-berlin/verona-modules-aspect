import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mediaPlayerTimeFormat',
  standalone: false
})
export class MediaPlayerTimeFormatPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  /**
   * A playing time as `mm:ss`. The value is counted in **minutes**, not seconds: the whole part is the
   * minutes, the fraction becomes the seconds, so `1.5` reads as `01:30`. Both parts are padded to two
   * digits, and a time beyond an hour keeps counting the minutes up rather than starting an hour field.
   */
  transform(value: number = 0): string {
    const minutes: number = Math.floor(value);
    const seconds: number = Math.floor((value - minutes) * 60);
    return `${minutes.toString(10).padStart(2, '0')}:${seconds.toString(10).padStart(2, '0')}`;
  }
}
