import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeResourceUrl',
    standalone: false
})
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(resourceUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl);
  }
}
