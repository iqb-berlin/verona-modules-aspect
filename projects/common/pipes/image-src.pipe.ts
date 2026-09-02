import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageSrc',
  standalone: false
})
export class ImageSrcPipe implements PipeTransform {
  /**
   * The picture a widget stored in its state, as a source an `img` can use. The state is JSON and may
   * carry `asImage` either as a bare base64 string or as a complete data URL; both come back usable.
   *
   * Everything else yields `null`, and quietly: no state, no picture in it, and JSON that does not
   * parse are the same answer, so a broken state shows no image rather than breaking the page.
   */
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
