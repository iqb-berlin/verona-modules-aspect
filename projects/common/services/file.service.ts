import { Injectable } from '@angular/core';

import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH } from 'common/config';
import { ImageOptions } from 'common/models/image-interfaces';
import { ImageResampler } from 'common/utils/image-resampler';

export interface FileInformation {
  name: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
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
      img.onload = () => {
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
            FileService.drawScaled(ctx, img, width, height);
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
   * `ImageResampler` does the scaling rather than the engine, because the engines read a 2x2 block
   * of source pixels whatever the factor is and lose the fine detail authors compare against their
   * picture editor (#1434). Where it gives up -- no canvas context, or a buffer the device will not
   * hand out -- the engine's own drawing stands in: it is what this improves on, not something that
   * must not happen. Nothing may throw past here, because all of it runs in an `onload` outside the
   * executor of the promise in `scaleImage`, which would then neither resolve nor reject.
   */
  private static drawScaled(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
  ): void {
    const source = img.naturalWidth || img.width;
    /* Nothing worth resampling. Both axes are scaled by the one ratio `scaleImage` worked out, so a
       width that came back unchanged means the picture keeps its size -- which is the case of
       re-encoding at a lower quality (#1398) -- or shrinks by less than the half pixel the rounding
       swallowed. A kernel run at that factor reproduces the image at the cost of the whole pass. */
    const resampled = width < source ? ImageResampler.scaleDown(img, width, height) : null;
    if (resampled) {
      ctx.putImageData(resampled, 0, 0);
      return;
    }
    ctx.drawImage(img, 0, 0, width, height);
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
