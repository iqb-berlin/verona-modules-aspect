import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RichTextEditorComponent } from 'editor/modules/rich-text-editor/components/rich-text-editor/rich-text-editor.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray
} from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from 'common/services/file.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-editor-checkbox-wizard-dialog',
  imports: [
    TranslateModule,
    MatDialogModule,
    MatButton,
    RichTextEditorComponent,
    MatCheckbox,
    CdkDrag,
    CdkDropList,
    CdkTextareaAutosize,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatSuffix,
    NgForOf,
    FormsModule,
    MatLabel
  ],
  templateUrl: './checkbox-dialog.component.html',
  styleUrls: ['./checkbox-dialog.component.scss']
})
export class CheckboxWizardDialogComponent {
  text1: string = '';
  options: string[] = [];
  useImages: boolean = false;

  constructor(private dialogService: DialogService) {}

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

  // eslint-disable-next-line class-methods-use-this
  removeListItem(list: string[], i: number) {
    list.splice(i, 1);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.options, event.previousIndex, event.currentIndex);
  }
}
