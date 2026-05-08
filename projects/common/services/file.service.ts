import { Injectable } from '@angular/core';

import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH } from 'common/config';
import { ImageOptions } from 'common/interfaces';

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

  /* DEPRECATED: Use static upload-inputs instead! */
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

        if (width <= maxWidth && height <= maxHeight) {
          resolve(base64Image);
        } else {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const outputMimeType = options.targetMimeType || mimeType;
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

  /* DEPRECATED: Use static upload-inputs instead! */
  static loadAudio(): Promise<FileInformation> {
    return FileService.loadFile(['audio/*'], true);
  }

  /* DEPRECATED: Use static upload-inputs instead! */
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
