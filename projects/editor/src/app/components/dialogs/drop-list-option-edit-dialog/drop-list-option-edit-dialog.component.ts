import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-drop-list-option-edit-dialog',
  templateUrl: './drop-list-option-edit-dialog.component.html',
  styleUrls: ['./drop-list-option-edit-dialog.component.scss'],
  standalone: false
})
export class DropListOptionEditDialogComponent {
  newLabel = { ...this.data.value };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { value: DragNDropValueObject },
              private dialogService: DialogService) { }

  async loadImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.newLabel.imgSrc = file.content;
      this.newLabel.imgFileName = file.name;
    }
  }

  async loadAudio() {
    const audio = await FileService.loadAudio();
    this.newLabel.audioSrc = audio.content;
    this.newLabel.audioFileName = audio.name;
  }
}
