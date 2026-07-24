import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RichTextEditorComponent } from 'editor/modules/text-editor/components/rich-text-editor/rich-text-editor.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray
} from '@angular/cdk/drag-drop';
import {
  ClassicTemplateOptions, SortTemplateOptions, TwoPageTemplateOptions
} from 'editor/src/app/section-templates/droplist-interfaces';
import { Label } from 'common/models/label-interfaces';
import { FileService } from 'common/services/file.service';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MatActionList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'aspect-editor-droplist-wizard-dialog',
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    RichTextEditorComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    MatRadioModule,
    NgIf,
    MatExpansionModule,
    MatCheckboxModule,
    MatToolbarModule,
    NgTemplateOutlet,
    CdkDrag,
    CdkDropList,
    NgForOf,
    MatInputModule,
    TextFieldModule,
    MatIconModule,
    MatActionList,
    MatListItem
  ],
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
