/* How wide the Lanczos kernel reaches, in target pixels. Three is the usual choice and the one
   measured here: two is a little softer on small text, and more than three buys nothing that
   survives the JPEG encoder. */
const LANCZOS_RADIUS = 3;

/* How much larger than the target the image has to stay for the engine's own halving to take
   another step before the kernel does the rest. A halving averages four pixels into one, and every
   engine measured does that correctly, so the pre-pass is quality the kernel would have produced
   anyway -- at a quarter of the pixels per step.

   One and a half, measured against the kernel run on the full resolution: the result after the
   encoder is the same to within 0.06 RMSE, which is noise. The number cannot be lowered to one,
   tempting as the smaller buffer is: the halving would then land on the target itself whenever the
   factor is a power of two, leaving the kernel a factor of one and the whole picture to the engine
   -- at factor four that gave back three quarters of what the change is worth. Nor is two better:
   the pre-pass then does not fire at all below factor four, so an ordinary 4032 to 1200 runs the
   kernel on twelve megapixels (615 ms against 235 ms).

   What it buys is a bound: whatever the source, the kernel reads fewer than three times the target
   per axis, so the buffers follow the size the author asked for and not the size of their camera.
   The one case it cannot bound is a mild shrink of a huge picture -- 4032 to 3000 is below the
   factor at which any halving is allowed -- and there the allocation can fail, which is why
   `scaleDown` is allowed to give up. */
const LANCZOS_PREPASS_LIMIT = 1.5;

/**
 * Which source pixels one target pixel is made of, and with what weight.
 *
 * The indices are already clamped to the source, so the filtering loop has no edge case of its own,
 * and the weights already sum to one.
 */
interface ResampleKernel {
  indices: Int32Array;
  weights: Float32Array;
}

/**
 * Makes a picture smaller, with a Lanczos kernel of its own rather than the browser's filter.
 *
 * What the engines do with `drawImage` is a 2x2 block of source pixels whatever the factor is:
 * shrinking to a third, nine of every ten pixels are not averaged away but never read, and that is
 * the detail authors compare against their picture editor and miss (#1434). `resizeQuality` on
 * `createImageBitmap` is the standard's answer to that, but only two of the three engines act on it,
 * and which of the two ways is the better one differs between versions of the same browser --
 * measured on the same photo at factor 2.5, Safari lost 8.9 where Firefox lost 7.7, and Safari's
 * loss grew to 19.1 at factor 8 while Firefox stayed at 13.4.
 *
 * Doing it here answers all of that at once, and the result is the best of the ones measured: 7.7 at
 * factor 2.5 and 13.3 at factor 8, which is the encoder's share alone. It costs 150-210 ms of the
 * main thread for a twelve megapixel photo, about what the engine's own way already cost in Firefox
 * and Safari.
 *
 * No library and no worker: `scripts/distpacker.js` knows of no worker or WASM file, and there is
 * not one worker in the repository. The kernel is some hundred lines of arithmetic, which is the
 * smaller part of what a dependency would have to be worth.
 */
export abstract class ImageResampler {
  /**
   * The picture at the size asked for, or null where the browser will not do it.
   *
   * Null is the honest answer twice over: an engine may hand out no canvas context at all, and the
   * buffers are large enough that a device may refuse them -- a mild shrink of a twelve megapixel
   * photo reads all twelve megapixels, because no halving is allowed at that factor. Callers fall
   * back to the engine's own drawing, which is what this improves on rather than replaces.
   */
  static scaleDown(img: HTMLImageElement, width: number, height: number): ImageData | null {
    try {
      const pixels = ImageResampler.readPixels(img, width, height);
      return pixels && ImageResampler.resample(pixels, width, height);
    } catch {
      /* Whatever the device would not give out. Reading the pixels and holding two buffers of them
         is the whole risk here; the arithmetic itself cannot throw. */
      return null;
    }
  }

  /**
   * The source pixels the kernel will read, halved by the engine while that is free of charge.
   *
   * Two things happen here. The pixels have to be read out at all, because a kernel cannot run on a
   * decoded image, only on numbers. And a large image is halved on the way, as long as it stays
   * `LANCZOS_PREPASS_LIMIT` times larger than the target: those steps average four pixels into one,
   * which the engines do correctly, and each of them leaves the kernel a quarter of the work. For a
   * twelve megapixel photo down to 750 px that is the difference between 450 ms and 150 ms.
   *
   * The last halved copy is read out where it lies. Copying it into a canvas asked for with
   * `willReadFrequently` would be a second buffer of the same size for one single read.
   */
  private static readPixels(img: HTMLImageElement, width: number, height: number): ImageData | null {
    let source: HTMLImageElement | HTMLCanvasElement = img;
    let stepWidth = img.naturalWidth || img.width;
    let stepHeight = img.naturalHeight || img.height;
    let halved = false;

    while (Math.floor(stepWidth / 2) >= width * LANCZOS_PREPASS_LIMIT &&
           Math.floor(stepHeight / 2) >= height * LANCZOS_PREPASS_LIMIT) {
      const half = document.createElement('canvas');
      half.width = Math.floor(stepWidth / 2);
      half.height = Math.floor(stepHeight / 2);
      const halfCtx = half.getContext('2d');
      if (!halfCtx) return null;
      halfCtx.drawImage(source, 0, 0, half.width, half.height);
      source = half;
      stepWidth = half.width;
      stepHeight = half.height;
      halved = true;
    }

    if (halved) {
      const drawn = (source as HTMLCanvasElement).getContext('2d');
      return drawn && drawn.getImageData(0, 0, stepWidth, stepHeight);
    }

    const reader = document.createElement('canvas');
    reader.width = stepWidth;
    reader.height = stepHeight;
    const readerCtx = reader.getContext('2d', { willReadFrequently: true });
    if (!readerCtx) return null;
    readerCtx.drawImage(source, 0, 0, stepWidth, stepHeight);
    return readerCtx.getImageData(0, 0, stepWidth, stepHeight);
  }

  /**
   * Scales the pixels down with a Lanczos kernel, one axis after the other.
   *
   * Separating the axes is what makes this affordable: filtering both at once would read the square
   * of the pixels the two passes read together.
   *
   * The colours are multiplied by their alpha before the filtering and divided out again after. A
   * fully transparent pixel has no colour left to contribute, and a kernel that averaged its raw
   * bytes -- which are whatever was left there -- would draw them into the edge of anything
   * transparent as a halo.
   */
  static resample(source: ImageData, width: number, height: number): ImageData {
    const columns = ImageResampler.kernel(source.width, width);
    const rows = ImageResampler.kernel(source.height, height);
    const horizontal = new Float32Array(width * source.height * 4);

    for (let y = 0; y < source.height; y++) {
      const rowStart = y * source.width;
      for (let x = 0; x < width; x++) {
        const { indices, weights } = columns[x];
        let red = 0;
        let green = 0;
        let blue = 0;
        let alpha = 0;
        for (let i = 0; i < indices.length; i++) {
          const offset = (rowStart + indices[i]) * 4;
          const weight = weights[i];
          const opacity = source.data[offset + 3] / 255;
          red += source.data[offset] * opacity * weight;
          green += source.data[offset + 1] * opacity * weight;
          blue += source.data[offset + 2] * opacity * weight;
          alpha += opacity * weight;
        }
        const target = (y * width + x) * 4;
        horizontal[target] = red;
        horizontal[target + 1] = green;
        horizontal[target + 2] = blue;
        horizontal[target + 3] = alpha;
      }
    }

    const result = new ImageData(width, height);
    for (let y = 0; y < height; y++) {
      const { indices, weights } = rows[y];
      for (let x = 0; x < width; x++) {
        let red = 0;
        let green = 0;
        let blue = 0;
        let alpha = 0;
        for (let i = 0; i < indices.length; i++) {
          const offset = (indices[i] * width + x) * 4;
          const weight = weights[i];
          red += horizontal[offset] * weight;
          green += horizontal[offset + 1] * weight;
          blue += horizontal[offset + 2] * weight;
          alpha += horizontal[offset + 3] * weight;
        }
        const target = (y * width + x) * 4;
        /* Divided by the alpha the kernel arrived at, not by the byte it will be stored as: next to
           a hard alpha edge the kernel overshoots past 1, and dividing by a clamped 1 there would
           leave the colour brighter than it was anywhere in the source (measured: 203 for a grey of
           200). The overshoot that is the sharpness stays; only what leaves the range a byte can
           hold is clipped, which is what every resampler does. */
        result.data[target] = ImageResampler.byteOf(red, alpha);
        result.data[target + 1] = ImageResampler.byteOf(green, alpha);
        result.data[target + 2] = ImageResampler.byteOf(blue, alpha);
        result.data[target + 3] = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
      }
    }
    return result;
  }

  /** One colour channel back out of its premultiplied sum, as the byte it is stored as. */
  private static byteOf(premultiplied: number, alpha: number): number {
    if (alpha <= 0) return 0;
    return Math.min(255, Math.max(0, Math.round(premultiplied / alpha)));
  }

  /**
   * Which source pixels one target pixel is made of, for one axis.
   *
   * The kernel is widened by the scaling factor, which is what makes it read the whole area instead
   * of a fixed neighbourhood: at factor four a target pixel stands for four source pixels, so the
   * three-pixel reach becomes twelve. Weights are normalised, so an edge pixel -- whose reach is
   * clamped and therefore lopsided -- keeps the brightness of its neighbourhood rather than fading
   * towards black.
   */
  private static kernel(sourceSize: number, targetSize: number): ResampleKernel[] {
    const ratio = sourceSize / targetSize;
    const reach = Math.max(1, ratio);
    const support = reach * LANCZOS_RADIUS;
    const kernels: ResampleKernel[] = [];

    for (let target = 0; target < targetSize; target++) {
      const centre = (target + 0.5) * ratio - 0.5;
      const first = Math.ceil(centre - support);
      const last = Math.floor(centre + support);
      const indices = new Int32Array(last - first + 1);
      const weights = new Float32Array(last - first + 1);
      let sum = 0;

      for (let index = first; index <= last; index++) {
        const weight = ImageResampler.lanczos((index - centre) / reach);
        indices[index - first] = Math.min(sourceSize - 1, Math.max(0, index));
        weights[index - first] = weight;
        sum += weight;
      }
      for (let i = 0; i < weights.length; i++) weights[i] /= sum;
      kernels.push({ indices, weights });
    }
    return kernels;
  }

  /** The Lanczos window, zero outside its radius and one at the centre, where the quotient is 0/0. */
  private static lanczos(x: number): number {
    if (x === 0) return 1;
    if (Math.abs(x) >= LANCZOS_RADIUS) return 0;
    const scaled = Math.PI * x;
    return (LANCZOS_RADIUS * Math.sin(scaled) * Math.sin(scaled / LANCZOS_RADIUS)) / (scaled * scaled);
  }
}
