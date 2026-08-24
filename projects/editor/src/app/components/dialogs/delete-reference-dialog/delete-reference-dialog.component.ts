import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';

@Component({
  selector: 'aspect-delete-reference-dialog',
  templateUrl: './delete-reference-dialog.component.html',
  styleUrls: ['./delete-reference-dialog.component.scss'],
  standalone: false
})
export class DeleteReferenceDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { refs: ReferenceList[] }) { }
}
