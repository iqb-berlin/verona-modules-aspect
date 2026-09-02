import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LikertRowElement } from 'common/models/elements/likert-row';
import { TextLabel } from 'common/models/label-interfaces';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { VariableAlias } from 'common/utils/variable-alias';

@Component({
  selector: 'aspect-likert-row-edit-dialog',
  templateUrl: './likert-row-edit-dialog.component.html',
  styleUrls: ['./likert-row-edit-dialog.component.scss'],
  standalone: false
})
export class LikertRowEditDialogComponent {
  /** The one place the rule for ids and aliases is written down. */
  readonly aliasPattern = VariableAlias.PATTERN_SOURCE;

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

  /** Sends the image that is already in the label through the compression dialog (#1378). */
  async compressImage(): Promise<void> {
    const compressed = await this.dialogService.compressEmbeddedImage(this.newLikertRow.rowLabel.imgSrc as string);
    if (compressed) this.newLikertRow.rowLabel.imgSrc = compressed;
  }
}
