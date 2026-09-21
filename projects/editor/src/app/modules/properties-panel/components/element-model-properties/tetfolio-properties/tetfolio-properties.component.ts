import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TetfolioProperties } from 'common/models/elements/tetfolio';
import { distpack, findEntryHtml } from 'common/utils/distpacker-browser';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/** Loads a Tetfolio export zip, packs it into one self-contained HTML document and writes the
   result into the element's `htmlContent`. */
@Component({
  selector: 'aspect-tetfolio-properties',
  standalone: false,
  templateUrl: './tetfolio-properties.component.html',
  styleUrls: ['./tetfolio-properties.component.scss']
})
export class TetfolioPropertiesComponent {
  @Input() combinedProperties!: Merged<TetfolioProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof TetfolioProperties;
      value: string | number | boolean | null;
      isInputValid?: boolean | null
    }>();

  isProcessing = false;
  processingError: string | null = null;
  lastZipName: string | null = null;

  constructor(private translateService: TranslateService) { }

  async onZipSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isProcessing = true;
    this.processingError = null;
    this.lastZipName = file.name;

    try {
      // 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build
      // under Vitest browser mode and crashes at import time on createRequire.
      const { unzipSync } = await import('fflate/browser');

      const arrayBuffer = await file.arrayBuffer();
      const unzipped = unzipSync(new Uint8Array(arrayBuffer));

      const fileMap = new Map<string, Uint8Array>();
      (Object.entries(unzipped) as [string, Uint8Array][]).forEach(([filePath, data]) => {
        fileMap.set(filePath, data);
      });

      const entryHtml = findEntryHtml(fileMap);
      if (!entryHtml) {
        this.processingError = this.translateService.instant('tetfolioZipNoHtml');
        return;
      }

      const html = distpack(fileMap, entryHtml);
      if (!html) {
        this.processingError = this.translateService.instant('tetfolioZipPackFailed');
        return;
      }

      this.updateModel.emit({ property: 'htmlContent', value: html });
    } catch (e) {
      this.processingError = this.translateService.instant(
        'tetfolioZipError',
        { message: e instanceof Error ? e.message : String(e) }
      );
    } finally {
      this.isProcessing = false;
      input.value = '';
    }
  }
}
