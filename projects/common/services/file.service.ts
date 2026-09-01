import { Injectable } from '@angular/core';

import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH } from 'common/config';
import { ImageOptions } from 'common/models/image-interfaces';

export interface FileInformation {
  name: string;
  content: string;
}

/* The pattern `probeResampling` scales down: white but for the two by two pixels in its middle.
   Averaged over the whole square that single pixel is 255 * 60/64 = 239; a filter that reads only
   the middle answers with the black square instead. Measured answers are 239, 233 and 0, so the
   tolerance only has to keep the two kinds apart. */
const RESIZE_PROBE_SIZE = 8;
const RESIZE_PROBE_MEAN = 239;
const RESIZE_PROBE_TOLERANCE = 60;

/**
 * What the engine can do when it makes a picture smaller.
 *
 * `viaBitmap` is the way this engine draws it best, `readsWholeArea` whether that best comes near
 * the average of the pixels it stands for. The two are not the same question: an engine can be fine
 * without the bitmap (Chrome drawing from its own smaller copies) and coarse with it (Safari, which
 * ignores the request), which is why both are answered separately (#1434).
 */
export interface ResamplingSupport {
  viaBitmap: boolean;
  readsWholeArea: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  /** The engine's answer to `probeResampling`, kept for the session. */
  private static resampling: Promise<ResamplingSupport> | undefined;

  static saveUnitToFile(unitJSON: string): void {
    const anchor = document.createElement('a');
    anchor.download = 'export.json';
    anchor.href = window.URL.createObjectURL(new File([unitJSON], 'export.json'));
    document.body.appendChild(anchor);
    anchor.click();
  }

  /** DEPRECATED: Use static upload-inputs instead! */
  static async loadFile(fileTypes: string[] = [], asBase64: boolean = false): Promise<FileInformation> {
    return new Promise<FileInformation>((resolve, reject) => {
      const fileUploadElement = document.createElement('input');
      fileUploadElement.type = 'file';
      fileUploadElement.accept = fileTypes.toString();
      fileUploadElement.addEventListener('change', event => {
        const uploadedFile = (event.target as HTMLInputElement).files?.[0];
        const reader = new FileReader();
        reader.onload = async loadEvent => resolve({
          name: uploadedFile?.name as string,
          content: loadEvent.target?.result as string
        });
        reader.onerror = errorEvent => reject(errorEvent);
        if (uploadedFile) {
          asBase64 ? reader.readAsDataURL(uploadedFile) : reader.readAsText(uploadedFile);
        }
      });
      fileUploadElement.click();
    });
  }

  static async getRawFile(accept: string): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const fileUploadElement = document.createElement('input');
      fileUploadElement.type = 'file';
      fileUploadElement.accept = accept;
      fileUploadElement.addEventListener('change', event => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No file selected'));
        }
      });
      fileUploadElement.click();
    });
  }

  static isResizable(mimeType: string): boolean {
    const resizableMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/gif'];
    return resizableMimeTypes.includes(mimeType);
  }

  /**
   * The same question for an image that is already stored, whose type is only known from the `data:`
   * prefix of its base64. Answers `false` for anything that is not a data URL at all -- an SVG, an
   * empty property, a URL -- which is what the compress buttons disable themselves on (#1378).
   */
  static isResizableBase64(base64: string | null | undefined): boolean {
    if (!base64) return false;
    return FileService.isResizable(base64.match(/^data:([^;]+);/)?.[1] || '');
  }

  /**
   * Whether `toDataURL` lets a quality decide anything for this type. PNG and GIF come back encoded
   * losslessly whatever quality is asked for, so re-encoding them buys nothing.
   */
  static supportsQuality(mimeType: string): boolean {
    return ['image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType);
  }

  static scaleImage(base64Image: string, options: ImageOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || '';

      const resizableMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/gif'];
      if (!resizableMimeTypes.includes(mimeType) || options.uncompressed) {
        resolve(base64Image);
        return;
      }

      const img = new Image();
      img.src = base64Image;
      img.onload = async () => {
        const maxWidth = options.maxWidth || IMAGE_MAX_WIDTH;
        const maxHeight = options.maxHeight || Number.MAX_SAFE_INTEGER;
        const quality = options.quality !== undefined ? options.quality : IMAGE_COMPRESSION_QUALITY;

        let { width, height } = img;

        const outputMimeType = options.targetMimeType || mimeType;
        const needsResize = width > maxWidth || height > maxHeight;
        const needsConversion = options.targetMimeType !== undefined && options.targetMimeType !== mimeType;
        /* Asking for the same size in the same format is a no-op unless the caller wants the image
           re-encoded, and only a type whose quality means something can act on that (#1398). */
        const needsRecompression = options.recompress === true && FileService.supportsQuality(outputMimeType);

        if (!needsResize && !needsConversion && !needsRecompression) {
          resolve(base64Image);
        } else {
          const ratio = needsResize ? Math.min(maxWidth / width, maxHeight / height) : 1;
          /* Rounded, because `canvas.width` truncates what it is given while the drawing keeps the
             fractional size: a canvas of 499 was filled to 499.9, which is half a pixel of
             misregistration in every row plus a last row that fell off the bottom (#1434). */
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            await FileService.drawScaled(ctx, img, width, height);
            if (outputMimeType === 'image/png' || outputMimeType === 'image/gif') {
              resolve(canvas.toDataURL('image/png'));
            } else if (outputMimeType === 'image/webp') {
              resolve(canvas.toDataURL('image/webp', quality));
            } else {
              resolve(canvas.toDataURL('image/jpeg', quality));
            }
          } else {
            reject(new Error('Canvas context not available'));
          }
        }
      };
      img.onerror = error => reject(error);
    });
  }

  /**
   * Draws the image onto the context at the size its canvas was made for.
   *
   * `drawImage` leaves the resampling filter to the engine, and the one every engine measured here
   * uses reads a 2x2 block of source pixels whatever the factor is: shrinking to a third, nine of
   * every ten pixels are not averaged away but never read, and that is the detail users compare
   * against their picture editor and miss (#1434). `createImageBitmap` takes a `resizeQuality`
   * instead, which Chrome and Firefox answer with a filter that reads the whole area.
   *
   * Safari answers it with the same 2x2 block, and asking for the bitmap there is a little worse
   * than not asking, so the way is taken only where `resamplingSupport` has seen it pay off.
   */
  private static async drawScaled(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
  ): Promise<void> {
    if ((await FileService.resamplingSupport()).viaBitmap) {
      try {
        const bitmap = await createImageBitmap(
          img,
          { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' }
        );
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        return;
      } catch {
        // Whatever the engine could not do with the bitmap, it can still draw the image itself.
      }
    }
    ctx.drawImage(img, 0, 0, width, height);
  }

  /**
   * What this engine can do when it scales a picture down, asked once and remembered for the
   * session: the answer belongs to the engine, and the dialog scales the image again on every
   * keystroke.
   */
  static resamplingSupport(): Promise<ResamplingSupport> {
    FileService.resampling = FileService.resampling || FileService.probeResampling();
    return FileService.resampling;
  }

  /**
   * Lets both ways scale the probe pattern down to its single average pixel: the closer answer wins,
   * and a tie leaves it at the drawing, which is the cheaper of the two. Whether the winner is any
   * good is then a second question, and the one the dialog passes on -- an engine can lose the
   * comparison and still be fine, or win it and still be coarse.
   *
   * The pattern is handed over as a loaded image, not as the canvas it was painted on: an engine
   * that keeps smaller copies of a decoded image draws from those and reads the whole area, while
   * from a canvas the same call reads the middle only. Only the image says what `scaleImage` will
   * get -- which is also why the answer differs between the same browser with and without a GPU,
   * and why this is measured rather than looked up (#1434).
   *
   * What it cannot tell apart, measured: an engine accurate at every factor from one accurate at
   * powers of two, which is what a chain of halved copies gives. Scaling by eight is such a factor,
   * and a picture is more often scaled by something in between. A pattern at a factor in between
   * would not settle it either -- the correct answer there is only flat for a box filter, and the
   * filters worth having ring a little around it, so they would read as the coarse ones. The
   * comparison is therefore kept where its answer is unambiguous, and a tie stays with the drawing:
   * it is the cheaper of the two by some 60 ms per call.
   */
  private static async probeResampling(): Promise<ResamplingSupport> {
    const coarse = { viaBitmap: false, readsWholeArea: false };
    const pattern = document.createElement('canvas');
    pattern.width = RESIZE_PROBE_SIZE;
    pattern.height = RESIZE_PROBE_SIZE;
    const target = document.createElement('canvas');
    target.width = 1;
    target.height = 1;
    const patternCtx = pattern.getContext('2d');
    const targetCtx = target.getContext('2d', { willReadFrequently: true });
    if (!patternCtx || !targetCtx) return coarse;

    patternCtx.fillStyle = '#ffffff';
    patternCtx.fillRect(0, 0, RESIZE_PROBE_SIZE, RESIZE_PROBE_SIZE);
    patternCtx.fillStyle = '#000000';
    patternCtx.fillRect(RESIZE_PROBE_SIZE / 2 - 1, RESIZE_PROBE_SIZE / 2 - 1, 2, 2);

    const readOnePixel = (): number => targetCtx.getImageData(0, 0, 1, 1).data[0];
    const missesTheArea = (value: number): boolean => Math.abs(value - RESIZE_PROBE_MEAN) >
      RESIZE_PROBE_TOLERANCE;

    try {
      const img = new Image();
      img.src = pattern.toDataURL('image/png');
      await img.decode();

      targetCtx.drawImage(img, 0, 0, 1, 1);
      const drawn = readOnePixel();
      /* What the engine can do without any help. It decides the notice on its own wherever the
         bitmap is not to be had -- an engine that draws the whole area and cannot make bitmaps is
         not a coarse one, and must not be sent to another browser. */
      const drawing = { viaBitmap: false, readsWholeArea: !missesTheArea(drawn) };
      if (typeof createImageBitmap !== 'function') return drawing;

      try {
        const bitmap = await createImageBitmap(
          img,
          { resizeWidth: 1, resizeHeight: 1, resizeQuality: 'high' }
        );
        targetCtx.clearRect(0, 0, 1, 1);
        targetCtx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const resized = readOnePixel();
        if (Math.abs(resized - RESIZE_PROBE_MEAN) >= Math.abs(drawn - RESIZE_PROBE_MEAN)) return drawing;
        return { viaBitmap: true, readsWholeArea: !missesTheArea(resized) };
      } catch {
        // An engine that refuses the resizing options still has its own drawing, measured above.
        return drawing;
      }
    } catch {
      return coarse;
    }
  }

  /** DEPRECATED: Use static upload-inputs instead! */
  static loadAudio(): Promise<FileInformation> {
    return FileService.loadFile(['audio/*'], true);
  }

  /** DEPRECATED: Use static upload-inputs instead! */
  static loadVideo(): Promise<FileInformation> {
    return FileService.loadFile(['video/*'], true);
  }

  static async readFileAsText(file: File, asBase64: boolean = false): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      asBase64 ? reader.readAsDataURL(file) : reader.readAsText(file);
    });
  }
}
