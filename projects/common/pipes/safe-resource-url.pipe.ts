import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceUrl',
  standalone: false
})
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Marks a URL as trusted, which switches Angular's sanitizing of it off. Used for the `src` of the
   * three images a unit can show: the image element, the image of a hotspot element, and the picture in
   * a label.
   *
   * The URL is trusted unchecked. What reaches this pipe comes from the unit definition, so trusting it
   * is trusting whoever wrote the unit.
   */
  transform(resourceUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl);
  }
}
