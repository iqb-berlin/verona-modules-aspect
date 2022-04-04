import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-rich-text-simple-edit-dialog',
  template: `
    <aspect-rich-text-editor-simple [(content)]="data.content"
                                    [defaultFontSize]="data.defaultFontSize">
    </aspect-rich-text-editor-simple>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.content">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class RichTextSimpleEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { content: string, defaultFontSize: number }) { }
}
