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
});
