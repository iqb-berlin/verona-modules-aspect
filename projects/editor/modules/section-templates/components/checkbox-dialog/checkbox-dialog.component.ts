import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FileService } from 'common/services/file.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  standalone: false,
  selector: 'aspect-editor-checkbox-wizard-dialog',
  templateUrl: './checkbox-dialog.component.html',
  styleUrls: ['./checkbox-dialog.component.scss']
})
export class CheckboxWizardDialogComponent {
  text1: string = '';
  /** One list per mode, so switching image options neither shows a text as an image nor hands one
      over as such; confirming takes the list of the mode in force (#1610). */
  textOptions: string[] = [];
  imageOptions: string[] = [];
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

  /** Plain text, as the checkbox's label is everywhere else in the editor: the same dialog opens on a
      double click on a checkbox, and the properties panel edits the label in a text field (#1604). */
  editItem(list: string[], i: number) {
    this.dialogService.showTextEditDialog(list[i])
      .subscribe((result: string) => {
        if (result) {
          list[i] = result;
        }
      });
  }

  // eslint-disable-next-line class-methods-use-this
  removeListItem(list: string[], i: number) {
    list.splice(i, 1);
  }

  // eslint-disable-next-line class-methods-use-this
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }
}
