import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageSrc',
  standalone: false
})
export class ImageSrcPipe implements PipeTransform {
  transform(state: string | null | undefined): string | null {
    if (state) {
      try {
        const stateObj = JSON.parse(state);
        if (stateObj.asImage) {
          return stateObj.asImage.startsWith('data:') ?
            stateObj.asImage :
            `data:image/png;base64,${stateObj.asImage}`;
        }
      } catch (e) {
        // ignore invalid JSON
      }
    }
    return null;
  }
}
