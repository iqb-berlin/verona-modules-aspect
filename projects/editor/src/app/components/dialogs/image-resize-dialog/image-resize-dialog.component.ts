import {
  Component, Inject, OnDestroy, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  EMPTY, Subject, catchError, debounceTime, from, switchMap, takeUntil
} from 'rxjs';
import { FileService } from 'common/services/file.service';
import { ImageResizeDialogData } from 'common/models/image-interfaces';
import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH } from 'common/config';
import { MessageService } from 'editor/src/app/services/message.service';

/* How long the dialog waits before it scales the image again. The estimate is a full scaling, and
   with the resampling of #1434 that is 150-210 ms of the main thread for a twelve megapixel photo
   -- once per keystroke, and once per pointer move while the quality slider is dragged. */
const ESTIMATE_DELAY = 300;

@Component({
  selector: 'aspect-image-resize-dialog',
  templateUrl: './image-resize-dialog.component.html',
  styleUrls: ['./image-resize-dialog.component.scss'],
  standalone: false
})
export class ImageResizeDialogComponent implements OnInit, OnDestroy {
  originalWidth: number = 0;
  originalHeight: number = 0;
  originalSize: number = 0;
  estimatedSize: number = 0;

  /**
   * Whether the figure on screen is still the one for the settings above it. Between an edit and the
   * scaling that answers it the old figure stays, dimmed rather than removed: taking the line away
   * would move everything below it on every keystroke.
   */
  estimatePending: boolean = false;

  private estimateRequested = new Subject<void>();
  private ngUnsubscribe = new Subject<void>();

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
    /* Only the last of a burst is worth scaling: the boxes report per keystroke and the slider per
       pointer move, and none of the estimates in between is ever read. */
    this.estimateRequested
      .pipe(
        debounceTime(ESTIMATE_DELAY),
        switchMap(() => from(FileService.scaleImage(this.data.base64, this.data.options))
          .pipe(catchError(() => EMPTY))),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(scaled => {
        this.estimatedSize = Math.round((scaled.length * 3) / 4);
        this.estimatePending = false;
      });
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  updateEstimatedSize(): void {
    /* Both axes, because `scaleImage` decides on both. The height box writes the width back through
       the aspect ratio, and for an image far taller than it is wide that rounding can land on the
       original width again -- the image then shrinks while a width-only comparison says it does
       not. */
    this.willResize = !this.data.options.uncompressed && this.originalWidth > 0 &&
      ((this.data.options.maxWidth as number) < this.originalWidth ||
       (this.data.options.maxHeight as number) < this.originalHeight);
    this.estimatePending = true;
    this.estimateRequested.next();
  }

  /**
   * What `aspectNumberField` worked out for one of the two dimension boxes.
   *
   * The `min="1"` on both was never enforced, and the binding was two-way, so a 0, a negative
   * number or an emptied box went straight into the scaling options, and from there into
   * `FileService.scaleImage` (#1164).
   *
   * Every keystroke asks for a new estimate, but only the last of them is scaled, and the answer to
   * an edit that has been overtaken is dropped rather than raced against the current one -- see the
   * stream in `ngOnInit` (#1434).
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
