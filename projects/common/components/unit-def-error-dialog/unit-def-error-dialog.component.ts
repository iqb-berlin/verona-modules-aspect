import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aspect-unit-def-error-dialog',
  templateUrl: './unit-def-error-dialog.component.html',
  standalone: false
})
export class UnitDefErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}
