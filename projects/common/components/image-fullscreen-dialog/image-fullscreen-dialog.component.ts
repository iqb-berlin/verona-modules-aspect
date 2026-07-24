import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  imports: [MatDialogModule],
  templateUrl: './image-fullscreen-dialog.component.html'
})
export class ImageFullscreenDialog {
  readonly data = inject<{ src: string, alt: string }>(MAT_DIALOG_DATA);

  constructor(public dialogRef: MatDialogRef<ImageFullscreenDialog>) { }
}
