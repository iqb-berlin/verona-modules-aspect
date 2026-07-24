import { HasTextContentPipe } from './has-text-content.pipe';

describe('HasTextContentPipe', () => {
  let pipe: HasTextContentPipe;

  beforeEach(() => {
    pipe = new HasTextContentPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false for undefined, null and empty string', () => {
    expect(pipe.transform(undefined)).toBe(false);
    expect(pipe.transform(null)).toBe(false);
    expect(pipe.transform('')).toBe(false);
  });

  it('should return false for an empty paragraph', () => {
    expect(pipe.transform('<p></p>')).toBe(false);
  });

  it('should return false for markup containing only whitespace', () => {
    expect(pipe.transform('<p> </p>')).toBe(false);
    expect(pipe.transform('<p>&nbsp;</p>')).toBe(false);
    expect(pipe.transform('<p><strong>  </strong></p>')).toBe(false);
  });

  it('should return true for plain text', () => {
    expect(pipe.transform('some text')).toBe(true);
  });

  it('should return true for markup with text content', () => {
    expect(pipe.transform('<p>some text</p>')).toBe(true);
    expect(pipe.transform('<p><strong>bold</strong></p>')).toBe(true);
  });
});
