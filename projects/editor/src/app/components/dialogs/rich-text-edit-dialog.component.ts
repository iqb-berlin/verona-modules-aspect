import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-rich-text-edit-dialog',
  template: `
    <h2 mat-dialog-title>Text bearbeiten</h2>
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
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    aspect-rich-text-editor {min-height: 450px;}
  `
})
export class RichTextEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    content: string | Record<string, any>,
    defaultFontSize: number,
    clozeMode: boolean }) { }
}
