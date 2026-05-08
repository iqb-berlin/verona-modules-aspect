import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'supportsQuality',
  standalone: false
})
export class SupportsQualityPipe implements PipeTransform {
  transform(base64: string, targetMimeType?: string): boolean {
    if (targetMimeType === 'image/webp') return true;
    const mimeType = base64.match(/data:([^;]+);/)?.[1] || '';
    return ['image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType);
  }
}
