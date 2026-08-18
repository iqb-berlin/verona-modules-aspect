import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MathFormulaMarkup } from 'common/utils/math-formula-markup';

@Pipe({
  name: 'safeResourceHTML',
  standalone: false
})
export class SafeResourceHTMLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * The choke point for every stored rich text the app displays -- text element, the labels of
   * checkbox, radio, toggle button and image radio, dropdown options, tooltip and text image panel.
   * Formulas are rebuilt from their LaTeX on the way through, for the reasons on
   * `MathFormulaMarkup` (#1105); the pipe is pure, so that happens once per distinct text rather
   * than on every change detection run.
   */
  transform(safeHtml: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(MathFormulaMarkup.refreshInStoredHtml(safeHtml));
  }
}
