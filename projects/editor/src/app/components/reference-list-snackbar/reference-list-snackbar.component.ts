import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';

@Component({
  selector: 'aspect-reference-list-snackbar',
  standalone: false,
  templateUrl: './reference-list-snackbar.component.html',
  styleUrls: ['./reference-list-snackbar.component.scss']
})
export class ReferenceListSnackbarComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(public snackBarRef: MatSnackBarRef<ReferenceListSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
