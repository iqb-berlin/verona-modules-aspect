import { ImageResampler } from './image-resampler';

/* The complaint behind #1434: a picture scaled in the editor came out coarser than in a picture
   editor, because the engine's own filter reads a 2x2 block of source pixels whatever the factor is.
   These are the promises of the resampler that replaced it, and they are asked of it directly --
   through `FileService.scaleImage` they would say nothing, because the headless browser this suite
   runs in rasters a canvas on the CPU with a filter of its own that is good enough to pass every one
   of them. What holds `scaleImage` to this class are the two tests in `file.service.spec.ts`. */
describe('ImageResampler', () => {
  const filled = (width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void): ImageData => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    paint(ctx);
    return ctx.getImageData(0, 0, width, height);
  };

  const channel = (pixels: ImageData, offset: number = 0): number[] => {
    const values: number[] = [];
    for (let i = offset; i < pixels.data.length; i += 4) values.push(pixels.data[i]);
    return values;
  };

  const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

  describe('resample', () => {
    /* The whole area, not the middle: 60 of the 64 pixels are white, so the one pixel they become
       is 239. A filter that reads a 2x2 block answers with the black middle instead. */
    it('should read the whole area', () => {
      const source = filled(8, 8, ctx => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 8, 8);
        ctx.fillStyle = '#000000';
        ctx.fillRect(3, 3, 2, 2);
      });

      const scaled = ImageResampler.resample(source, 1, 1);

      expect(Math.abs(scaled.data[0] - 239)).toBeLessThanOrEqual(3);
    });

    // Nine to three: a factor that is not a power of two, where a chain of halved copies gives out.
    it('should read the whole area at a factor that is not a power of two', () => {
      const source = filled(9, 9, ctx => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 9, 9);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 3, 3);
      });

      const scaled = ImageResampler.resample(source, 3, 3);

      // One ninth of the picture is black, so the nine pixels it becomes average to 227.
      expect(Math.abs(mean(channel(scaled)) - 227)).toBeLessThanOrEqual(6);
    });

    /* A raster of single-pixel lines is the picture that collapses when a filter reads a fixed
       neighbourhood: every third source column is read and the answer is black or white, where the
       lines average to a grey. The kernel rings a little around that grey, which is the sharpness,
       so the band is wide -- but it stays far from either end. */
    it('should not let a one-pixel line raster collapse', () => {
      const source = filled(30, 30, ctx => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 30, 30);
        ctx.fillStyle = '#000000';
        for (let x = 0; x < 30; x += 2) ctx.fillRect(x, 0, 1, 30);
      });

      const values = channel(ImageResampler.resample(source, 10, 10));

      expect(Math.min(...values)).toBeGreaterThan(40);
      expect(Math.max(...values)).toBeLessThan(215);
    });

    /* The weights are normalised, so an edge pixel -- whose reach is clamped and therefore lopsided
       -- keeps the brightness of its neighbourhood. Without that the border fades towards black. */
    it('should keep one colour one colour, edges included', () => {
      const source = filled(10, 10, ctx => {
        ctx.fillStyle = 'rgb(128, 64, 32)';
        ctx.fillRect(0, 0, 10, 10);
      });

      const scaled = ImageResampler.resample(source, 3, 3);

      expect(channel(scaled, 0).every(value => value === 128)).toBe(true);
      expect(channel(scaled, 1).every(value => value === 64)).toBe(true);
      expect(channel(scaled, 2).every(value => value === 32)).toBe(true);
    });

    /* Half opaque, half transparent, with a different colour under the transparent half. Two things
       can go wrong at that edge, and each has its own test below: the colour under the transparent
       pixels bleeding across, and the un-premultiplying brightening the opaque side. */
    const alphaEdge = (red: number, green: number): ImageData => filled(16, 4, ctx => {
      const raw = ctx.createImageData(16, 4);
      for (let i = 0; i < raw.data.length; i += 4) {
        const opaque = (i / 4) % 16 < 8;
        raw.data[i] = opaque ? red : 0;
        raw.data[i + 1] = opaque ? 0 : green;
        raw.data[i + 2] = 0;
        raw.data[i + 3] = opaque ? 255 : 0;
      }
      ctx.putImageData(raw, 0, 0);
    });

    /* The colour bytes under a fully transparent pixel are whatever was left there, and a kernel
       that averaged them raw would draw them into the edge of anything transparent. */
    it('should not let the colour under a transparent pixel bleed into the edge', () => {
      const scaled = ImageResampler.resample(alphaEdge(255, 255), 8, 2);

      // The column next to the edge on the opaque side: red, and no green worth seeing.
      expect(scaled.data[2 * 4]).toBeGreaterThan(200);
      expect(scaled.data[2 * 4 + 1]).toBeLessThan(30);
      expect(scaled.data[3 * 4 + 1]).toBeLessThan(30);
    });

    /* Next to a hard alpha edge the kernel overshoots past an alpha of one. Dividing the colour by
       a clamped one there hands back more colour than the source holds anywhere -- 203 for a grey
       of 200 -- so it is divided by the alpha the kernel arrived at. */
    it('should not brighten the opaque side past the colour it had', () => {
      const scaled = ImageResampler.resample(alphaEdge(200, 0), 8, 2);

      expect(Math.max(...channel(scaled, 0))).toBeLessThanOrEqual(200);
    });

    // A picture with an alpha channel keeps it: the transparent half stays transparent.
    it('should resample the alpha channel too', () => {
      const source = filled(16, 4, ctx => {
        const raw = ctx.createImageData(16, 4);
        for (let i = 0; i < raw.data.length; i += 4) {
          raw.data[i] = 255;
          raw.data[i + 3] = (i / 4) % 16 < 8 ? 255 : 0;
        }
        ctx.putImageData(raw, 0, 0);
      });

      const scaled = ImageResampler.resample(source, 8, 2);

      expect(scaled.data[3]).toBe(255);
      expect(scaled.data[7 * 4 + 3]).toBe(0);
    });
  });

  describe('scaleDown', () => {
    const image = (width: number, height: number): Promise<HTMLImageElement> => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#000000';
      for (let x = 0; x < width; x += 4) ctx.fillRect(x, 0, 2, height);
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      return img.decode().then(() => img);
    };

    it('should give back the size it was asked for', async () => {
      const scaled = ImageResampler.scaleDown(await image(120, 60), 32, 16);

      expect(scaled?.width).toBe(32);
      expect(scaled?.height).toBe(16);
    });

    /* The halving pre-pass is the engine's, and it may only take a step while the picture stays
       half again as large as the target -- otherwise a factor that is a power of two lands on the
       target and leaves the kernel nothing to do. The result is what is checked, because how many
       steps it took is the pre-pass's own business: a raster of two-pixel lines averages to the
       same grey however it is read, as long as the whole area is read. */
    it('should read the whole area of a large picture too', async () => {
      const scaled = ImageResampler.scaleDown(await image(960, 480), 30, 15) as ImageData;

      const values = channel(scaled);
      expect(Math.abs(mean(values) - 128)).toBeLessThanOrEqual(20);
      expect(Math.min(...values)).toBeGreaterThan(40);
      expect(Math.max(...values)).toBeLessThan(215);
    });

    /* Both ways of giving up have to be null rather than a throw. The caller runs inside an
       `onload`, outside the executor of the promise it has to settle, so a throw would leave that
       promise neither resolved nor rejected -- a size estimate in the dialog that never arrives and
       a `compressEmbeddedImage` that never returns (#1434). */
    describe('giving up', () => {
      afterEach(() => {
        vi.restoreAllMocks();
      });

      // What a device refuses is the buffer: reading twelve megapixels out is the expensive part.
      it('should give up rather than throw when the pixels cannot be read', async () => {
        const img = await image(120, 60);
        vi.spyOn(CanvasRenderingContext2D.prototype, 'getImageData')
          .mockImplementation(() => { throw new Error('cannot hold that'); });

        expect(ImageResampler.scaleDown(img, 32, 16)).toBeNull();
      });

      it('should give up when the browser hands out no canvas context', async () => {
        const img = await image(120, 60);
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

        expect(ImageResampler.scaleDown(img, 32, 16)).toBeNull();
      });
    });
  });
});
