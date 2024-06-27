// eslint-disable-next-line max-classes-per-file
import {
  Component, Directive, HostListener, inject, Input
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';

@Directive({
  selector: '[imageFullscreen]',
  standalone: true
})
export class ImageFullscreenDirective {
  @Input() imgSrc!: SafeResourceUrl;
  @Input() alt!: string;

  readonly dialog = inject(MatDialog);

  @HostListener('click') onClick() {
    this.openFullScreenDialog(this.imgSrc, this.alt);
  }

  openFullScreenDialog(src: SafeResourceUrl, alt: string): void {
    this.dialog.open(ImageFullscreenDialog, {
      data: { src, alt },
      panelClass: 'image-fullscreen-dialog'
    });
  }
}

@Component({
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <mat-dialog-content (click)="dialogRef.close()">
      <img [style.padding.px]="5" [src]="data.src" [alt]="data.alt">
    </mat-dialog-content>
  `
})
export class ImageFullscreenDialog {
  readonly data = inject<{ src: string, alt: string }>(MAT_DIALOG_DATA);

  constructor(public dialogRef: MatDialogRef<ImageFullscreenDialog>) { }
}
