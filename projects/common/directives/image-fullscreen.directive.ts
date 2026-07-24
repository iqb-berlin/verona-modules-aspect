import {
  Directive, HostListener, inject, Input
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import {
  ImageFullscreenDialog
} from 'common/components/image-fullscreen-dialog/image-fullscreen-dialog.component';

@Directive({
  selector: '[imageFullscreen]',
  standalone: false
})
export class ImageFullscreenDirective {
  @Input() imgSrc!: SafeResourceUrl;
  @Input() allowFullscreen!: boolean;
  @Input() alt!: string;

  readonly dialog = inject(MatDialog);

  @HostListener('click') onClick() {
    if (this.allowFullscreen) this.openFullScreenDialog(this.imgSrc, this.alt);
  }

  openFullScreenDialog(src: SafeResourceUrl, alt: string): void {
    this.dialog.open(ImageFullscreenDialog, {
      data: { src, alt },
      panelClass: 'image-fullscreen-dialog'
    });
  }
}
