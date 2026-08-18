import { TestBed } from '@angular/core/testing';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MathFormulaPipe } from './math-formula.pipe';

describe('MathFormulaPipe', () => {
  let pipe: MathFormulaPipe;
  let sanitizer: DomSanitizer;

  const rendered = (node: unknown): string => sanitizer
    .sanitize(SecurityContext.HTML, pipe.transform(node as never)) ?? '';

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new MathFormulaPipe(sanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /* The cloze renders its formula nodes as data rather than as a markup string, so it needs the LaTeX
     read off the node itself -- same reason as in SafeResourceHTMLPipe (#1105). */
  it('should build the markup from the LaTeX on the node', () => {
    const result = rendered({ attrs: { formula: '\\overline{BC}', formulaHTML: '<math></math>' } });

    expect(result).toContain('ML__latex');
    expect(result).not.toContain('<math');
  });

  it('should fall back to the stored markup when the node carries no LaTeX', () => {
    expect(rendered({ attrs: { formula: '', formulaHTML: '<b>gespeichert</b>' } }))
      .toBe('<b>gespeichert</b>');
    expect(rendered({ attrs: { formulaHTML: '<b>gespeichert</b>' } })).toBe('<b>gespeichert</b>');
  });

  it('should render nothing for a node with neither', () => {
    expect(rendered({ attrs: {} })).toBe('');
    expect(rendered({})).toBe('');
    expect(rendered(null)).toBe('');
  });
});
