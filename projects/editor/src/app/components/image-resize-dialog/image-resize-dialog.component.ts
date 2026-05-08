import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { ImageResizeDialogData } from 'common/interfaces';
import { IMAGE_COMPRESSION_QUALITY, IMAGE_MAX_WIDTH } from 'common/config';

@Component({
  selector: 'aspect-image-resize-dialog',
  templateUrl: './image-resize-dialog.component.html',
  styleUrls: ['./image-resize-dialog.component.scss'],
  standalone: false
})
export class ImageResizeDialogComponent implements OnInit {
  originalWidth: number = 0;
  originalHeight: number = 0;
  keepAspectRatio: boolean = true;
  originalSize: number = 0;
  estimatedSize: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ImageResizeDialogData) {
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
      this.updateEstimatedSize();
    };
  }

  async updateEstimatedSize(): Promise<void> {
    const res = await FileService.scaleImage(this.data.base64, this.data.options);
    this.estimatedSize = Math.round((res.length * 3) / 4);
  }

  onWidthChange(value: number): void {
    if (this.keepAspectRatio && this.originalWidth && this.originalHeight) {
      this.data.options.maxHeight = Math.round(value * (this.originalHeight / this.originalWidth));
    }
    this.updateEstimatedSize();
  }

  onHeightChange(value: number): void {
    if (this.keepAspectRatio && this.originalWidth && this.originalHeight) {
      this.data.options.maxWidth = Math.round(value * (this.originalWidth / this.originalHeight));
    }
    this.updateEstimatedSize();
  }

  onQualityChange(): void {
    this.updateEstimatedSize();
  }

  onUncompressedChange(): void {
    this.updateEstimatedSize();
  }
}
