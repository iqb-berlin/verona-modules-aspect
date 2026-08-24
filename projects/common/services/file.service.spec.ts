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

    it('should return the original image when uncompressed is set', async () => {
      const source = createImage(20, 10);
      const result = await FileService
        .scaleImage(source, { maxWidth: 10, uncompressed: true, targetMimeType: 'image/webp' });
      expect(result).toBe(source);
    });
  });
});
