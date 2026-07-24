import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasTextContent',
  standalone: false
})
export class HasTextContentPipe implements PipeTransform {
  transform(html: string | undefined | null): boolean {
    if (!html) return false;
    return !!new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim();
  }
}
