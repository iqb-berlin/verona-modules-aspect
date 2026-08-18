import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MathFormulaMarkup } from 'common/utils/math-formula-markup';

/**
 * A formula node as it sits in a cloze document: the node itself, not a markup string, because the
 * cloze keeps its document as data and renders the node directly. Declared structurally and not as the
 * cloze's own node type -- the pipe needs one attribute, and stating that keeps it free of the cloze
 * model and free of a cast at the call site.
 */
export interface MathFormulaNode {
  attrs?: Record<string, unknown>;
}

@Pipe({
  name: 'mathFormula',
  standalone: false
})
export class MathFormulaPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Builds a formula's markup from the LaTeX on its node (#1105, see `MathFormulaMarkup`). Without
   * usable LaTeX it falls back to the markup the unit froze next to it, which is what the cloze
   * displayed before -- broken in some engines, but better than an empty formula.
   */
  transform(node: MathFormulaNode | null | undefined): SafeHtml {
    const latex = node?.attrs?.[MathFormulaMarkup.LATEX_ATTRIBUTE];
    const stored = node?.attrs?.formulaHTML;

    if (typeof latex === 'string' && latex !== '') {
      return this.sanitizer.bypassSecurityTrustHtml(MathFormulaMarkup.fromLatex(latex));
    }
    return this.sanitizer.bypassSecurityTrustHtml(typeof stored === 'string' ? stored : '');
  }
}
