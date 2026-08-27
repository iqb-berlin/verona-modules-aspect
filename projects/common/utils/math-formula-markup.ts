import { convertLatexToMarkup } from '@iqb/mathlive';

/**
 * Formula markup for display, derived from the LaTeX a unit stores rather than from the HTML it stores
 * alongside it.
 *
 * The rich text editor freezes both into the unit: `formula` holds the LaTeX, `formulaHTML` the markup
 * that the renderer of the day produced. Only the LaTeX is durable. Until #1105 the display trusted the
 * frozen markup, which tied every unit to the renderer it happened to be written with:
 *
 * - written before editor 2.12.4 (2026-05-06), the markup is KaTeX's MathML output, which the browser
 *   typesets itself -- Firefox does that well, Chromium and WebKit do not. An overline then covers the
 *   first character instead of the whole expression, and a fraction comes out a third too small. Same
 *   unit, different picture per engine, measured spreads up to 48% in width.
 * - written since, it is MathLive markup, laid out by CSS and the KaTeX web fonts, which all three
 *   engines render within 2% of each other.
 *
 * Deriving the markup at display time makes every unit render like the one written today, in every
 * engine, and leaves the stored data untouched -- no migration step, and a unit opened in an older
 * player still shows what it always showed there.
 */
export abstract class MathFormulaMarkup {
  /** The element the rich text editor wraps a formula in; also its tag in a stored unit. */
  static readonly NODE_TAG = 'aspect-nodeview-math-formula';

  /** Attribute holding the LaTeX. Its sibling `formulaHTML` is the frozen markup, deliberately unused. */
  static readonly LATEX_ATTRIBUTE = 'formula';

  /** A selection mark, as `TextMarkingUtils` writes it into the text a reader has marked. */
  private static readonly MARKING_TAG = 'aspect-marked';

  /** The markup MathLive lays out for a piece of LaTeX, to be rendered with the KaTeX web fonts the
      applications embed. */
  static fromLatex(latex: string): string {
    return convertLatexToMarkup(latex);
  }

  private static readonly LATEX_PATTERN = /\bformula="([^"]*)"/i;

  /**
   * Rebuilds the markup of every formula in a stored rich text, and changes NOTHING else -- not one
   * character outside a formula node.
   *
   * That is a requirement, not tidiness. A reader's selection marks are stored as character offsets
   * into the rendered text and restored into the stored one
   * (`ElementModelElementCodeMappingService.markingBase`), and anchors are matched as strings, which is
   * why `modifyAnchors` inserts an empty `class` attribute. Parsing the text into a document and
   * serialising it back would renormalise quoting and entities across the whole text and shift every
   * offset behind the change, so the formula content is spliced in place instead.
   *
   * A text without a formula is returned by identity. A formula node without LaTeX keeps what it
   * stored -- there is nothing better to show it from.
   */
  static refreshInStoredHtml(storedHtml: string): string {
    if (!storedHtml || !storedHtml.includes(MathFormulaMarkup.NODE_TAG)) return storedHtml;

    const closingTag = `</${MathFormulaMarkup.NODE_TAG}>`;
    let result = '';
    let position = 0;

    for (;;) {
      const nodeStart = storedHtml.indexOf(`<${MathFormulaMarkup.NODE_TAG}`, position);
      const openingTagEnd = nodeStart === -1 ? -1 : MathFormulaMarkup.endOfOpeningTag(storedHtml, nodeStart);
      const contentEnd = openingTagEnd === -1 ? -1 : storedHtml.indexOf(closingTag, openingTagEnd);
      if (contentEnd === -1) return result + storedHtml.substring(position);

      const openingTag = storedHtml.substring(nodeStart, openingTagEnd);
      const content = storedHtml.substring(openingTagEnd, contentEnd);
      result += storedHtml.substring(position, nodeStart) + openingTag +
        MathFormulaMarkup.contentFor(openingTag, content) + closingTag;
      position = contentEnd + closingTag.length;
    }
  }

  /**
   * The index just past the `>` that ends an opening tag, counting from its `<`.
   *
   * Quote-aware, and that is the whole point: the `formulaHTML` attribute holds markup with RAW angle
   * brackets -- only the quotes in it are escaped, as `&quot;` -- so a scan for the next `>` ends inside
   * the attribute value and cuts the tag in half. Which is what a regex of the form `<tag[^>]*>` does,
   * and what it did here until measuring in the player showed the formula arriving broken.
   */
  private static endOfOpeningTag(html: string, tagStart: number): number {
    let quote: string | null = null;
    for (let i = tagStart; i < html.length; i++) {
      const character = html[i];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === '\'') {
        quote = character;
      } else if (character === '>') {
        return i + 1;
      }
    }
    return -1;
  }

  private static contentFor(openingTag: string, content: string): string {
    /* A mark a reader dragged across the formula sits INSIDE this content. Rebuilding would drop it from
       view while the stored answer still holds it, so such a formula keeps what it has -- the old
       picture for that one formula, rather than a mark that vanishes. */
    if (content.includes(MathFormulaMarkup.MARKING_TAG)) return content;

    const latex = MathFormulaMarkup.LATEX_PATTERN.exec(openingTag)?.[1];
    if (!latex) return content;

    return `<span>${MathFormulaMarkup.fromLatex(MathFormulaMarkup.decode(latex))}</span>`;
  }

  /** The LaTeX sits in an attribute, so `&amp;` and `&quot;` reach us escaped. */
  private static decode(attributeValue: string): string {
    const holder = document.createElement('textarea');
    holder.innerHTML = attributeValue;
    return holder.value;
  }
}
