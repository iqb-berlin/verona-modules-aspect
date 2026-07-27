import { SupportsQualityPipe } from 'editor/src/app/pipes/supports-quality.pipe';

describe('SupportsQualityPipe', () => {
  const pipe = new SupportsQualityPipe();

  it('should always support quality when converting to webp', () => {
    expect(pipe.transform('data:image/png;base64,AAAA', 'image/webp')).toBe(true);
  });

  it('should support quality for jpeg sources', () => {
    expect(pipe.transform('data:image/jpeg;base64,AAAA')).toBe(true);
    expect(pipe.transform('data:image/jpg;base64,AAAA')).toBe(true);
  });

  it('should support quality for webp sources', () => {
    expect(pipe.transform('data:image/webp;base64,AAAA')).toBe(true);
  });

  it('should not support quality for png sources', () => {
    expect(pipe.transform('data:image/png;base64,AAAA')).toBe(false);
  });

  it('should not support quality when no mime type can be extracted', () => {
    expect(pipe.transform('no-data-url')).toBe(false);
  });
});
