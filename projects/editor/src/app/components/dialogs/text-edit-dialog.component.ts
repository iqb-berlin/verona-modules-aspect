import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'aspect-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #inputElement matInput type="text" [value]="data.text">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
    `
})
export class TextEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}
