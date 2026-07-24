import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-text-edit-dialog',
  templateUrl: './text-edit-dialog.component.html',
  standalone: false
})
export class TextEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}
