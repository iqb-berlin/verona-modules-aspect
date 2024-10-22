import { Injectable } from '@angular/core';

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
        reader.onload = loadEvent => resolve({
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

  /* DEPRECATED: Use static upload-inputs instead! */
  static loadImage(): Promise<FileInformation> {
    return FileService.loadFile(['image/*'], true);
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
