import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClozeDocument } from '../../../../../common/models/uI-element';

@Component({
  selector: 'aspect-rich-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <aspect-rich-text-editor [(content)]="data.content"
                               [clozeMode]="data.clozeMode"
                               [defaultFontSize]="data.defaultFontSize">
      </aspect-rich-text-editor>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.content">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class RichTextEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    content: string | Record<string, any>,
    defaultFontSize: number,
    clozeMode: boolean }) { }
}
