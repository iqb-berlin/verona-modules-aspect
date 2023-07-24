import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-unit-def-error-dialog',
  template: `
    <h1 mat-dialog-title>Unit-Definition kann nicht geladen werden</h1>
    <p mat-dialog-content>{{data.text}}</p>
  `
})
export class UnitDefErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}
