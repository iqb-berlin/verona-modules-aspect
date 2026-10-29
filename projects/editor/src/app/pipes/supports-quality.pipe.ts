import { Pipe, PipeTransform } from '@angular/core';
import { FileService } from 'common/services/file.service';

@Pipe({
  name: 'supportsQuality',
  standalone: false
})
export class SupportsQualityPipe implements PipeTransform {
  /**
   * Whether the quality slider decides anything for the image the dialog is showing. The answer is
   * about the type that comes OUT, so a conversion to WebP settles it before the source type does.
   * `FileService.supportsQuality` is the one place the list lives; `scaleImage` asks it too (#1398).
   */
  transform(base64: string, targetMimeType?: string): boolean {
    return FileService.supportsQuality(FileService.outputMimeType(base64, targetMimeType));
  }
}
