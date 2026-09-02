import { Pipe, PipeTransform } from '@angular/core';
import { FileService } from 'common/services/file.service';

@Pipe({
  name: 'isCompressibleImage',
  standalone: false
})
export class IsCompressibleImagePipe implements PipeTransform {
  /**
   * Whether a stored image can be scaled at all. Decides whether the "compress" buttons are offered
   * or disabled: an SVG, a property without an image, and anything that is not a data URL cannot be
   * scaled, and opening the dialog for them would achieve nothing (#1378).
   */
  transform(base64: string | null | undefined): boolean {
    return FileService.isResizableBase64(base64);
  }
}
