import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasTextContent',
  standalone: false
})
export class HasTextContentPipe implements PipeTransform {
  /**
   * Whether a stored rich text has any readable text in it. An empty paragraph -- what a cleared editor
   * leaves behind -- counts as nothing, and so does a text made only of whitespace.
   *
   * A text whose whole content is an image or a formula also counts as nothing here; where that has to
   * count, `HasRenderableContentPipe` is the one to ask.
   */
  transform(html: string | undefined | null): boolean {
    if (!html) return false;
    return !!new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim();
  }
}
