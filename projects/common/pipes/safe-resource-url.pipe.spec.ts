import { TestBed } from '@angular/core/testing';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceUrlPipe } from './safe-resource-url.pipe';

describe('SafeResourceUrlPipe', () => {
  let pipe: SafeResourceUrlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeResourceUrlPipe(sanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should bypass security with the given URL', () => {
    const bypassSpy = vi.spyOn(sanitizer, 'bypassSecurityTrustResourceUrl');
    pipe.transform('data:image/png;base64,abc');
    expect(bypassSpy).toHaveBeenCalledWith('data:image/png;base64,abc');
  });

  it('should return a URL that sanitizes back to the original string', () => {
    const result = pipe.transform('data:image/png;base64,abc');
    expect(sanitizer.sanitize(SecurityContext.RESOURCE_URL, result)).toBe('data:image/png;base64,abc');
  });
});
