import { IsCompressibleImagePipe } from './is-compressible-image.pipe';

describe('IsCompressibleImagePipe', () => {
  let pipe: IsCompressibleImagePipe;

  beforeEach(() => {
    pipe = new IsCompressibleImagePipe();
  });

  it('should accept the raster formats the scaler handles', () => {
    ['png', 'jpeg', 'jpg', 'webp', 'bmp', 'gif'].forEach(format => {
      expect(pipe.transform(`data:image/${format};base64,AAAA`)).toBe(true);
    });
  });

  it('should reject an SVG', () => {
    // Not a raster image: scaleImage would hand it back unchanged, so the dialog has nothing to offer
    expect(pipe.transform('data:image/svg+xml;base64,AAAA')).toBe(false);
  });

  it('should reject an element without an image', () => {
    expect(pipe.transform(null)).toBe(false);
    expect(pipe.transform(undefined)).toBe(false);
    expect(pipe.transform('')).toBe(false);
  });

  it('should reject something that is not a data url', () => {
    expect(pipe.transform('https://example.org/bild.png')).toBe(false);
    expect(pipe.transform('image/png')).toBe(false);
  });
});
