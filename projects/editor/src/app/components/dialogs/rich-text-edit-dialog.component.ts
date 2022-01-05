import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rich-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <app-rich-text-editor [(text)]="data.text"
                            [clozeMode]="data.clozeMode"
                            [defaultFontSize]="data.defaultFontSize">
      </app-rich-text-editor>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.text">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class RichTextEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    text: string,
    defaultFontSize: number,
    clozeMode: boolean }) { }
}
