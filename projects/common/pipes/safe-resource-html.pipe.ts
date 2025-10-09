import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'safeResourceHTML',
    standalone: false
})
export class SafeResourceHTMLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(safeHtml: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(safeHtml);
  }
}
