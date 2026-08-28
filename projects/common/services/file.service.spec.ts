import { FileService } from './file.service';

describe('FileService', () => {
  const createImage = (width: number, height: number, mimeType: string = 'image/png'): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL(mimeType);
  };

  const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => new Promise(resolve => {
    const img = new Image();
    img.src = base64;
    img.onload = () => resolve({ width: img.width, height: img.height });
  });

  describe('scaleImage', () => {
    it('should return the original image when no resize and no conversion is needed', async () => {
      const source = createImage(10, 10);
      const result = await FileService.scaleImage(source, { maxWidth: 100, maxHeight: 100 });
      expect(result).toBe(source);
    });

    it('should convert to WebP even when the dimensions stay the same', async () => {
      const source = createImage(10, 10);
      const result = await FileService
        .scaleImage(source, { maxWidth: 10, maxHeight: 10, targetMimeType: 'image/webp' });
      expect(result.startsWith('data:image/webp')).toBe(true);
    });

    it('should convert to WebP without upscaling when the max dimensions are larger', async () => {
      const source = createImage(10, 10);
      const result = await FileService
        .scaleImage(source, { maxWidth: 100, maxHeight: 100, targetMimeType: 'image/webp' });
      expect(result.startsWith('data:image/webp')).toBe(true);
      const dimensions = await getImageDimensions(result);
      expect(dimensions.width).toBe(10);
      expect(dimensions.height).toBe(10);
    });

    it('should not re-encode a WebP image when the target type matches the source', async () => {
      const source = createImage(10, 10, 'image/webp');
      const result = await FileService
        .scaleImage(source, { maxWidth: 100, maxHeight: 100, targetMimeType: 'image/webp' });
      expect(result).toBe(source);
    });

    it('should downscale while keeping the aspect ratio', async () => {
      const source = createImage(20, 10);
      const result = await FileService.scaleImage(source, { maxWidth: 10, maxHeight: 10 });
      const dimensions = await getImageDimensions(result);
      expect(dimensions.width).toBe(10);
      expect(dimensions.height).toBe(5);
    });

    /* Without `recompress` the same size in the same format means "nothing to do", so the quality
       decided nothing at all - which is what made the dialog's slider a no-op (#1398). */
    it('should re-encode at the given quality when asked to, although nothing else changes', async () => {
      const source = createImage(20, 20, 'image/jpeg');
      const result = await FileService
        .scaleImage(source, { maxWidth: 20, quality: 0.1, recompress: true });
      expect(result).not.toBe(source);
      expect(result.startsWith('data:image/jpeg')).toBe(true);
      const dimensions = await getImageDimensions(result);
      expect(dimensions.width).toBe(20);
    });

    // A PNG comes back encoded losslessly whatever quality is asked for, so there is nothing to gain.
    it('should leave a PNG alone even when a re-encode is asked for', async () => {
      const source = createImage(20, 20);
      const result = await FileService
        .scaleImage(source, { maxWidth: 20, quality: 0.1, recompress: true });
      expect(result).toBe(source);
    });

    // The flag is off unless someone sets it, so an image nobody asked to change travels untouched.
    it('should leave an image alone without the flag', async () => {
      const source = createImage(20, 20, 'image/jpeg');
      const result = await FileService.scaleImage(source, { maxWidth: 20, quality: 0.1 });
      expect(result).toBe(source);
    });

    it('should return the original image when uncompressed is set', async () => {
      const source = createImage(20, 10);
      const result = await FileService
        .scaleImage(source, { maxWidth: 10, uncompressed: true, targetMimeType: 'image/webp' });
      expect(result).toBe(source);
    });
  });

  describe('supportsQuality', () => {
    it('should name the types whose quality decides something', () => {
      expect(FileService.supportsQuality('image/jpeg')).toBe(true);
      expect(FileService.supportsQuality('image/jpg')).toBe(true);
      expect(FileService.supportsQuality('image/webp')).toBe(true);
    });

    it('should reject the lossless ones and anything unknown', () => {
      expect(FileService.supportsQuality('image/png')).toBe(false);
      expect(FileService.supportsQuality('image/gif')).toBe(false);
      expect(FileService.supportsQuality('')).toBe(false);
    });
  });

  /* Which formats can be scaled is already answered for an upload, where the File carries its type.
     An image that is only in the unit carries it in its own `data:` prefix, and the compress buttons
     ask this one to decide whether they are usable at all (#1378). */
  describe('isResizableBase64', () => {
    it('should accept the raster formats scaleImage can re-encode', () => {
      expect(FileService.isResizableBase64('data:image/png;base64,abc')).toBe(true);
      expect(FileService.isResizableBase64('data:image/jpeg;base64,abc')).toBe(true);
      expect(FileService.isResizableBase64('data:image/webp;base64,abc')).toBe(true);
    });

    /* An SVG has no pixels to scale away - drawing it onto a canvas would rasterize it, which is a
       loss rather than a compression. */
    it('should reject an SVG', () => {
      expect(FileService.isResizableBase64('data:image/svg+xml;base64,abc')).toBe(false);
    });

    // The properties the buttons read are nullable, and an element without an image holds ''.
    it('should reject an absent image', () => {
      expect(FileService.isResizableBase64(null)).toBe(false);
      expect(FileService.isResizableBase64(undefined)).toBe(false);
      expect(FileService.isResizableBase64('')).toBe(false);
    });

    // Not everything in an image property is a data URL; a plain URL has no type to read at all.
    it('should reject a source that is not a data URL', () => {
      expect(FileService.isResizableBase64('https://example.org/bild.png')).toBe(false);
    });
  });
});
