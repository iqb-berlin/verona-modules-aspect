import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextImageLabel } from 'common/models/label-interfaces';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-label-edit-dialog',
  templateUrl: './label-edit-dialog.component.html',
  styleUrls: ['./label-edit-dialog.component.scss'],
  standalone: false
})
export class LabelEditDialogComponent {
  newLabel = { ...this.data.label };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { label: TextImageLabel },
              private dialogService: DialogService) { }

  async loadImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.newLabel.imgSrc = file.content;
      this.newLabel.imgFileName = file.name;
    }
  }

  /** Sends the image that is already in the label through the compression dialog (#1378). */
  async compressImage(): Promise<void> {
    const compressed = await this.dialogService.compressEmbeddedImage(this.newLabel.imgSrc as string);
    if (compressed) this.newLabel.imgSrc = compressed;
  }
}
