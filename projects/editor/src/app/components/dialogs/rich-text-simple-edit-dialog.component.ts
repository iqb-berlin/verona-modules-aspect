import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { TextLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-rich-text-simple-edit-dialog',
  template: `
    <aspect-rich-text-editor-simple [(content)]="data.option.text"
                                    [defaultFontSize]="data.defaultFontSize">
    </aspect-rich-text-editor-simple>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.option">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class RichTextSimpleEditDialogComponent {
  constructor(public dialogRef: MatDialogRef<RichTextSimpleEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { option: TextLabel, defaultFontSize: number }) { }
}
