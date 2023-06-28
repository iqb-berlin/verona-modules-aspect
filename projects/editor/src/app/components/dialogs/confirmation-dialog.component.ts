import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-confirmation-dialog',
  template: `
    <div mat-dialog-title>Bestätigen</div>
    <div mat-dialog-content [class.warning] = "data.isWarning">
        {{data.text}}
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
    `,
  styles: [
    '.warning {color: red;}'
  ]
})
export class ConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string, isWarning: boolean }) { }
}
