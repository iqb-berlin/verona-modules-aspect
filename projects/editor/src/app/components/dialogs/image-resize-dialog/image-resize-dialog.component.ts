import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { ImageResizeDialogData } from 'common/models/image-interfaces';
import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH } from 'common/config';
import { MessageService } from 'editor/src/app/services/message.service';

@Component({
  selector: 'aspect-image-resize-dialog',
  templateUrl: './image-resize-dialog.component.html',
  styleUrls: ['./image-resize-dialog.component.scss'],
  standalone: false
})
export class ImageResizeDialogComponent implements OnInit {
  originalWidth: number = 0;
  originalHeight: number = 0;
  originalSize: number = 0;
  estimatedSize: number = 0;

  /**
   * Whether the chosen options would give back a smaller picture, rather than only fewer bytes.
   *
   * Held rather than worked out in the template: the warning that goes with `hasFixedOverlays` binds
   * to it, and a binding that calls back into the class runs on every change detection (#1378).
   */
  willResize: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ImageResizeDialogData,
              private messageService: MessageService,
              private translateService: TranslateService) {
    this.data.options.maxWidth = this.data.options.maxWidth || IMAGE_MAX_WIDTH;
    this.data.options.quality = this.data.options.quality || IMAGE_COMPRESSION_QUALITY;
  }

  onFormatChange(checked: boolean): void {
    this.data.options.targetMimeType = checked ? 'image/webp' : undefined;
    this.updateEstimatedSize();
  }

  ngOnInit(): void {
    this.originalSize = Math.round((this.data.base64.length * 3) / 4);
    const img = new Image();
    img.src = this.data.base64;
    img.onload = () => {
      this.originalWidth = img.width;
      this.originalHeight = img.height;
      this.data.options.maxWidth = Math.min(this.data.options.maxWidth || IMAGE_MAX_WIDTH, img.width);
      this.data.options.maxHeight = Math.round(this.data.options.maxWidth * (img.height / img.width));
      this.updateEstimatedSize();
    };
  }

  async updateEstimatedSize(): Promise<void> {
    /* Both axes, because `scaleImage` decides on both. The height box writes the width back through
       the aspect ratio, and for an image far taller than it is wide that rounding can land on the
       original width again -- the image then shrinks while a width-only comparison says it does
       not. */
    this.willResize = !this.data.options.uncompressed && this.originalWidth > 0 &&
      ((this.data.options.maxWidth as number) < this.originalWidth ||
       (this.data.options.maxHeight as number) < this.originalHeight);
    const res = await FileService.scaleImage(this.data.base64, this.data.options);
    this.estimatedSize = Math.round((res.length * 3) / 4);
  }

  /**
   * What `aspectNumberField` worked out for one of the two dimension boxes.
   *
   * The `min="1"` on both was never enforced, and the binding was two-way, so a 0, a negative
   * number or an emptied box went straight into the scaling options, and from there into
   * `FileService.scaleImage` (#1164).
   *
   * The estimate is still recalculated per keystroke, and those calls are neither awaited nor
   * sequenced - whichever scaling finishes last wins, so a fast typist can be left with the
   * estimate for an earlier width. That was so before and is not touched here.
   *
   * The other dimension follows from the aspect ratio, which is why the write is not a plain
   * assignment: refusing one box has to leave both alone.
   */
  commitWidth(update: { value: number | null; isInputValid: boolean }): void {
    if (!this.accept(update)) return;
    this.data.options.maxWidth = update.value as number;
    this.onWidthChange(update.value as number);
  }

  commitHeight(update: { value: number | null; isInputValid: boolean }): void {
    if (!this.accept(update)) return;
    this.data.options.maxHeight = update.value as number;
    this.onHeightChange(update.value as number);
  }

  /** Both boxes are `required`, so a valid update carries a number; a refused one is said out loud. */
  private accept(update: { value: number | null; isInputValid: boolean }): boolean {
    if (update.isInputValid && update.value !== null) return true;
    this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    return false;
  }

  onWidthChange(value: number): void {
    if (value && this.originalWidth && this.originalHeight) {
      this.data.options.maxHeight = Math.round(value * (this.originalHeight / this.originalWidth));
    }
    this.updateEstimatedSize();
  }

  onHeightChange(value: number): void {
    if (value && this.originalWidth && this.originalHeight) {
      this.data.options.maxWidth = Math.round(value * (this.originalWidth / this.originalHeight));
    }
    this.updateEstimatedSize();
  }

  /**
   * Moving the slider is the moment a quality becomes a decision rather than a default, and only a
   * decision may re-encode an image the author did not ask to resize (#1398).
   */
  onQualityChange(): void {
    this.data.options.recompress = true;
    this.updateEstimatedSize();
  }

  onUncompressedChange(): void {
    this.updateEstimatedSize();
  }
}
