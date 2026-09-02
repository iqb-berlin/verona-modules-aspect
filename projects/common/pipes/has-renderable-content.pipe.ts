import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasRenderableContent',
  standalone: false
})
export class HasRenderableContentPipe implements PipeTransform {
  /**
   * Whether a piece of rich text draws anything at all.
   *
   * A rich text editor that has been emptied does not leave '' behind but an empty paragraph, at times
   * with a `<br>` in it -- and that paragraph takes a line's height wherever the text is placed (#965).
   *
   * The question is deliberately not the one `HasTextContentPipe` answers. A label can be a picture and
   * nothing else, or a formula: there is no text, and yet there is everything to draw.
   *
   * Hence the two rules below, both of which err towards drawing:
   *
   * - a non-breaking space counts as content. It is the usual way to keep a blank line in a rich text
   *   editor, and `trim()` would drop it: to that method U+00A0 is whitespace like any other.
   * - every element but the paragraphs and line breaks an emptied editor leaves behind counts, rather
   *   than a list of the ones known to draw. An empty heading passes the rule and takes a line, which
   *   is the defect this pipe is against -- but a list would have to name each new kind of node, and
   *   whatever it failed to name would be dropped from the page.
   */
  transform(html: string | undefined | null): boolean {
    if (!html) return false;
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const text = (body.textContent ?? '').replace(/[ \t\n\r\f\v]/g, '');
    return !!text || !!body.querySelector('*:not(p):not(br)');
  }
}
