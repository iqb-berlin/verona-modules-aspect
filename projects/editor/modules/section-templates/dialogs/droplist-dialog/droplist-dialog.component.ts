import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ClassicTemplateOptions, SortTemplateOptions, TwoPageTemplateOptions
} from 'editor/modules/section-templates/droplist-interfaces';
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

  constructor(private dialogService: DialogService) {
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.options.options, event.previousIndex, event.currentIndex);
  }

  editItem(list: string[], i: number) {
    this.dialogService.showLabelEditDialog({ text: list[i] })
      .subscribe((result: Label) => {
        if (result) {
          this.options.options[i] = result.text;
        }
      });
  }

  // eslint-disable-next-line class-methods-use-this
  removeListItem(list: string[], i: number) {
    list.splice(i, 1);
  }
}
