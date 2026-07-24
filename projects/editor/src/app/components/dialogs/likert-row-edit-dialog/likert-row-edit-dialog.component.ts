import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';
import { TextLabel } from 'common/models/label-interfaces';
import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-likert-row-edit-dialog',
  templateUrl: './likert-row-edit-dialog.component.html',
  styleUrls: ['./likert-row-edit-dialog.component.scss'],
  standalone: false
})
export class LikertRowEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { row: LikertRowElement, options: TextLabel[] },
              private dialogService: DialogService) { }

  newLikertRow = new LikertRowElement({
    ...this.data.row,
    rowLabel: { ...this.data.row.rowLabel }
  });

  async loadImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.newLikertRow.rowLabel.imgSrc = file.content;
      this.newLikertRow.rowLabel.imgFileName = file.name;
    }
  }
}
