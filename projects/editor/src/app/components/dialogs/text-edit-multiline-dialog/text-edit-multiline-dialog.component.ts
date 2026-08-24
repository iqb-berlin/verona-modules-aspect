import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-multiline-text-edit-dialog',
  templateUrl: './text-edit-multiline-dialog.component.html',
  standalone: false
})
export class TextEditMultilineDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}
