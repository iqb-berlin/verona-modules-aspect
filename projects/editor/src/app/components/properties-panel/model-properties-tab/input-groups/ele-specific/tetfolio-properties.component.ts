import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { UIElement } from 'common/models/elements/element';
import { distpack, findEntryHtml } from 'common/utils/distpacker-browser';

@Component({
  selector: 'aspect-tetfolio-properties',
  imports: [
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DecimalPipe
  ],
  template: `
    <fieldset>
      <legend>{{'toolbox.tetfolio' | translate}}</legend>

      <div class="fx-column-start-stretch">
        <div class="upload-section">
          <button mat-raised-button color="primary"
                  [disabled]="isProcessing"
                  (click)="zipInput.click()">
            <mat-icon>upload_file</mat-icon>
            {{'loadTetfolioZip' | translate}}
          </button>
          <input #zipInput type="file" accept=".zip"
                 style="display: none"
                 (change)="onZipSelected($event)">
          @if (isProcessing) {
            <mat-spinner diameter="24"></mat-spinner>
          }
        </div>
        @if (processingError) {
          <div class="error-text">{{ processingError }}</div>
        }
        @if (lastZipName && !processingError) {
          <div class="info-text">{{ lastZipName }}</div>
        }
        @if ($any(combinedProperties).htmlContent) {
          <div class="success-text">
            {{'tetfolioHtmlLoaded' | translate:
              { kb: ($any(combinedProperties).htmlContent.length / 1024) | number:'1.0-0' } }}
          </div>
        } @else if (!processingError) {
          <div class="error-text">{{'tetfolioNoHtmlContent' | translate}}</div>
        }
      </div>
    </fieldset>
  `,
  styles: [`
    .upload-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .success-text {
      color: green;
      font-size: 12px;
    }
    .error-text {
      color: #c62828;
      font-size: 12px;
    }
    .info-text {
      color: #555;
      font-size: 12px;
    }
  `]
})
export class TetfolioPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();

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
      const { unzipSync } = await import('fflate');

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
      // eslint-disable-next-line no-console
      console.error('[tetfolio-properties] ZIP processing failed:', e);
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
