import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClozeDocument } from 'common/models/elements/cloze';

@Component({
  selector: 'aspect-rich-text-edit-dialog',
  templateUrl: './rich-text-edit-dialog.component.html',
  styleUrls: ['./rich-text-edit-dialog.component.scss'],
  standalone: false
})
export class RichTextEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    content: string | ClozeDocument,
    defaultFontSize: number,
    clozeMode: boolean }) { }
}
