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

    /* `canvas.height` truncates what it is given while `drawImage` keeps the fractional size, so an
       unrounded 4.76 made a canvas of 4 that the picture was drawn onto at 4.76: every row half a
       pixel off, and the last one below the edge (#1434). */
    it('should round the scaled dimensions rather than truncate them', async () => {
      const source = createImage(21, 10);
      const result = await FileService.scaleImage(source, { maxWidth: 10 });
      const dimensions = await getImageDimensions(result);
      expect(dimensions.width).toBe(10);
      expect(dimensions.height).toBe(5);
    });

    // Rounding a height of 0.1 down would leave a canvas with no pixels at all to encode.
    it('should keep at least one pixel on each axis', async () => {
      const source = createImage(100, 10);
      const result = await FileService.scaleImage(source, { maxWidth: 1 });
      const dimensions = await getImageDimensions(result);
      expect(dimensions.width).toBe(1);
      expect(dimensions.height).toBe(1);
    });

    it('should return the original image when uncompressed is set', async () => {
      const source = createImage(20, 10);
      const result = await FileService
        .scaleImage(source, { maxWidth: 10, uncompressed: true, targetMimeType: 'image/webp' });
      expect(result).toBe(source);
    });
  });

  /* The complaint behind #1434: a picture scaled here came out coarser than in a picture editor,
     because the engine's own filter reads a 2x2 block of source pixels whatever the factor is. The
     pattern below is white but for the two by two pixels in its middle -- read as a whole it is a
     pale 239, read through that block it is the black middle. */
  describe('resampling', () => {
    const probePattern = (): string => {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#000000';
      ctx.fillRect(3, 3, 2, 2);
      return canvas.toDataURL('image/png');
    };

    const readFirstPixel = (base64: string): Promise<number> => new Promise(resolve => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, 1, 1).data[0]);
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    /* PNG all the way, so what comes back is the scaling and nothing else. The engine's own drawing
       is the yardstick: the picture that leaves here is never coarser than the one the engine would
       have drawn by itself, whichever way the probe decides. */
    it('should not read less of the picture than the engine would on its own', async () => {
      const source = probePattern();
      const img = new Image();
      img.src = source;
      await img.decode();
      const drawn = document.createElement('canvas');
      drawn.width = 1;
      drawn.height = 1;
      const drawnCtx = drawn.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
      drawnCtx.drawImage(img, 0, 0, 1, 1);
      const drawnValue = drawnCtx.getImageData(0, 0, 1, 1).data[0];

      const scaled = await readFirstPixel(await FileService.scaleImage(source, { maxWidth: 1 }));

      expect(scaled).toBeGreaterThanOrEqual(drawnValue);
    });

    /* Which way is taken is the engine's answer, so the two ways are tested by giving the answer.
       The engine these tests run in draws well enough by itself to say no. */
    it('should let the engine make the smaller picture where that reads more of it', async () => {
      vi.spyOn(FileService, 'resamplingSupport')
        .mockResolvedValue({ viaBitmap: true, readsWholeArea: true });
      const resizing = vi.spyOn(window, 'createImageBitmap');

      const scaled = await readFirstPixel(await FileService.scaleImage(probePattern(), { maxWidth: 1 }));

      expect(resizing).toHaveBeenCalledWith(
        expect.anything(),
        { resizeWidth: 1, resizeHeight: 1, resizeQuality: 'high' }
      );
      expect(scaled).toBeGreaterThan(200);
    });

    it('should draw the image itself where that is the better of the two', async () => {
      vi.spyOn(FileService, 'resamplingSupport')
        .mockResolvedValue({ viaBitmap: false, readsWholeArea: true });
      const resizing = vi.spyOn(window, 'createImageBitmap');

      const result = await FileService.scaleImage(probePattern(), { maxWidth: 4 });

      expect(resizing).not.toHaveBeenCalled();
      expect(await getImageDimensions(result)).toEqual({ width: 4, height: 4 });
    });

    // An engine that says yes and then cannot deliver still has to come back with a picture.
    it('should fall back to its own drawing when the bitmap cannot be made', async () => {
      vi.spyOn(FileService, 'resamplingSupport')
        .mockResolvedValue({ viaBitmap: true, readsWholeArea: true });
      vi.spyOn(window, 'createImageBitmap').mockRejectedValue(new Error('no bitmap here'));

      const result = await FileService.scaleImage(probePattern(), { maxWidth: 4 });

      expect(await getImageDimensions(result)).toEqual({ width: 4, height: 4 });
    });

    /* Whether the better way is any good is a question of its own: an engine that draws from its own
       smaller copies needs no bitmap and is fine, and one that ignores the request is coarse with
       and without it. The dialog says so, so the two answers must not be read off each other. */
    it('should answer for the way taken, not for the way that won', async () => {
      const support = await FileService.resamplingSupport();
      const source = probePattern();
      const scaled = await readFirstPixel(await FileService.scaleImage(source, { maxWidth: 1 }));

      expect(support.readsWholeArea).toBe(Math.abs(scaled - 239) <= 60);
    });

    // The answer belongs to the engine, and the dialog asks for it on every keystroke.
    it('should ask the engine only once', async () => {
      const first = FileService.resamplingSupport();
      expect(FileService.resamplingSupport()).toBe(first);
      expect(typeof (await first).viaBitmap).toBe('boolean');
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
