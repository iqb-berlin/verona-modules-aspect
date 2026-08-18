import { TestBed } from '@angular/core/testing';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceHTMLPipe } from './safe-resource-html.pipe';

describe('SafeResourceHTMLPipe', () => {
  let pipe: SafeResourceHTMLPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeResourceHTMLPipe(sanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should bypass security with the given HTML', () => {
    const bypassSpy = vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');
    pipe.transform('<b>fett</b>');
    expect(bypassSpy).toHaveBeenCalledWith('<b>fett</b>');
  });

  it('should return HTML that sanitizes back to the original string', () => {
    const result = pipe.transform('<b>fett</b>');
    expect(sanitizer.sanitize(SecurityContext.HTML, result)).toBe('<b>fett</b>');
  });

  /* Formulas are rebuilt from their LaTeX here, because the markup a unit stores is only as good as
     the renderer that wrote it: units written before editor 2.12.4 carry KaTeX's MathML, which
     Chromium and WebKit typeset wrongly -- an overline over the first character only (#1105). */
  describe('the formulas in a stored text (#1105)', () => {
    /* A formula as an editor before 2.12.4 stored it: KaTeX MathML, in the attribute and as markup. */
    const STORED_MATHML = '<span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML">' +
      '<semantics><mrow><mover accent="true"><mrow><mi>B</mi><mi>C</mi></mrow>' +
      '<mo stretchy="true">&#x203e;</mo></mover></mrow>' +
      '<annotation encoding="application/x-tex">\\overline{BC}</annotation></semantics></math></span>';
    /* Exactly as a unit stores it: the `formulahtml` value holds markup with RAW angle brackets and
       only its quotes escaped. A scan for the next `>` therefore ends inside this attribute -- the bug
       that a first attempt at the splice had, found by measuring in the player, not by a test. */
    const STORED_ATTRIBUTE = 'formulahtml="<span class=&quot;katex&quot;><math></math></span>"';
    const storedText = (attributes: string, markup: string): string => '<p>Text ' +
      `<aspect-nodeview-math-formula ${attributes}><span>${markup}</span>` +
      '</aspect-nodeview-math-formula></p>';

    const rendered = (html: string): string => sanitizer
      .sanitize(SecurityContext.HTML, pipe.transform(html)) ?? '';

    /* Queried on a DOM and not on the string: the stored `formulahtml` ATTRIBUTE still holds the old
       markup as text, so a string search for `<math` finds it there and says nothing about what a
       reader sees. */
    const asDom = (html: string): HTMLElement => {
      const holder = document.createElement('div');
      holder.innerHTML = rendered(html);
      return holder;
    };

    it('should replace stored MathML with markup built from the LaTeX', () => {
      const dom = asDom(storedText(`formula="\\overline{BC}" ${STORED_ATTRIBUTE}`, STORED_MATHML));

      expect(dom.querySelector('.ML__latex')).toBeTruthy();
      expect(dom.querySelector('math')).toBeNull();
      expect(dom.textContent).toContain('Text');
    });

    it('should keep the stored markup of a formula node without LaTeX', () => {
      const dom = asDom(storedText('formulahtml="x"', STORED_MATHML));

      expect(dom.querySelector('math')).toBeTruthy();
      expect(dom.querySelector('.ML__latex')).toBeNull();
    });

    /* The marking offsets and the anchor matching depend on this: outside the formula not one character
       may move, or a mark restored behind a formula lands in the wrong place (#1105 review). */
    it('should leave every character outside the formula untouched', () => {
      const formula = storedText(`formula="\\overline{BC}" ${STORED_ATTRIBUTE}`, STORED_MATHML)
        .replace('<p>Text ', '').replace('</p>', '');
      const text = '<p style="text-align: left">Vor <aspect-anchor class="" data-anchor-id="a1">Wort' +
        `</aspect-anchor> &amp; ${formula} nach</p>`;

      const result = rendered(text);
      const outside = (html: string): string => html.replace(
        /<aspect-nodeview-math-formula\b[^>]*>[\s\S]*?<\/aspect-nodeview-math-formula>/, '[FORMEL]'
      );

      expect(outside(result)).toBe(outside(text));
    });

    it('should hand a text without a formula through unchanged, by identity', () => {
      const text = '<p style="text-align: left">Text <strong>fett</strong> &amp; mehr</p>';
      const bypassSpy = vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');

      pipe.transform(text);

      expect(bypassSpy).toHaveBeenCalledWith(text);
    });
  });
});
