import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  static saveUnitToFile(unitJSON: string): void {
    const anchor = document.createElement('a');
    anchor.download = 'export.json';
    anchor.href = window.URL.createObjectURL(new File([unitJSON], 'export.json'));
    anchor.click();
  }

  static async loadFile(fileTypes: string[] = [], asBase64: boolean = false): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fileUploadElement = document.createElement('input');
      fileUploadElement.type = 'file';
      fileUploadElement.accept = fileTypes.toString();
      fileUploadElement.addEventListener('change', event => {
        const uploadedFile = (event.target as HTMLInputElement).files?.[0];
        const reader = new FileReader();
        reader.onload = loadEvent => resolve(loadEvent.target?.result as string);
        reader.onerror = errorEvent => reject(errorEvent);
        if (uploadedFile) {
          asBase64 ? reader.readAsDataURL(uploadedFile) : reader.readAsText(uploadedFile);
        }
      });
      fileUploadElement.click();
    });
  }

  static loadImage(): Promise<string> {
    return FileService.loadFile(['image/*'], true);
  }

  static loadAudio(): Promise<string> {
    return FileService.loadFile(['audio/*'], true);
  }

  static loadVideo(): Promise<string> {
    return FileService.loadFile(['video/*'], true);
  }
}
