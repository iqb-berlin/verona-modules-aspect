import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ClassicTemplateOptions, SortTemplateOptions, TwoPageTemplateOptions
} from 'editor/modules/section-templates/models/droplist-interfaces';
import { Label } from 'common/models/label-interfaces';
import { FileService } from 'common/services/file.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  standalone: false,
  selector: 'aspect-editor-droplist-wizard-dialog',
  templateUrl: './droplist-dialog.component.html',
  styleUrl: './droplist-dialog.component.scss'
})
export class DroplistWizardDialogComponent {
  templateVariant: 'classic' | '2pages' | 'sort' | undefined;
  options: ClassicTemplateOptions & SortTemplateOptions & TwoPageTemplateOptions;
  /** The image counterparts of `options.options` and `options.targetLabels`, so switching images in the
      two-page variant neither shows a text as an image nor hands one over as such (#1610). */
  srcImages: string[] = [];
  targetImages: string[] = [];

  constructor(private dialogService: DialogService,
              private dialogRef: MatDialogRef<DroplistWizardDialogComponent>) {
    this.options = {
      targetLabelAlignment: 'column',
      text1: '',
      text2: '',
      text3: '',
      headingSourceList: '',
      options: [],
      optionWidth: 'short',
      headingTargetLists: '',
      targetWidth: 'short',
      targetLabels: [],
      numbering: false,
      imageSize: 'medium',
      labelsBelow: false,
      targetListAlignment: 'row',
      srcUseImages: false,
      targetUseImages: false
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async loadImage(list: string[], eventTarget: HTMLInputElement): Promise<void> {
    const file = eventTarget.files?.[0];
    if (file) {
      const base64 = await FileService.readFileAsText(file, true);
      if (FileService.isResizable(file.type)) {
        this.dialogService.showImageResizeDialog(base64, {}).subscribe(async options => {
          if (options) {
            const imgSrc = await FileService.scaleImage(base64, options);
            list.push(imgSrc);
          }
        });
      } else {
        list.push(base64);
      }
    }
  }

  /** Serves both lists, the elements and the target labels; each drop reorders its own (#1595). */
  // eslint-disable-next-line class-methods-use-this
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  /** Offered for text items only: an image item is its data URL, which the dialog would show as text (#1595). */
  editItem(list: string[], i: number) {
    this.dialogService.showLabelEditDialog({ text: list[i] })
      .subscribe((result: Label) => {
        if (result) {
          list[i] = result.text;
        }
      });
  }

  // eslint-disable-next-line class-methods-use-this
  removeListItem(list: string[], i: number) {
    list.splice(i, 1);
  }

  /** The target switch is only offered while the elements are images, so it goes off with them: left on
      out of sight, it would hide the alignment choice and lay the targets out for images (#1610). */
  setSrcUseImages(useImages: boolean): void {
    this.options.srcUseImages = useImages;
    if (!useImages) this.options.targetUseImages = false;
  }

  /** Hands over the lists of the modes in force. */
  confirmAndClose(): void {
    this.dialogRef.close({
      variant: this.templateVariant,
      options: {
        ...this.options,
        options: this.options.srcUseImages ? this.srcImages : this.options.options,
        targetLabels: this.options.targetUseImages ? this.targetImages : this.options.targetLabels
      }
    });
  }
}
