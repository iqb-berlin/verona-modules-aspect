import { Component, Inject, Optional } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ReferenceRepair } from 'editor/src/app/classes/reference-manager';

/**
 * What loading a unit did about references into nothing: the elements whose references it removed, and the sections
 * whose visibility rules it found pointing into nothing but left for the author to decide (#1509).
 */
@Component({
  selector: 'aspect-invalid-reference-elements-list-snackbar',
  standalone: false,
  templateUrl: './fixed-references-snackbar.component.html',
  styleUrls: ['./fixed-references-snackbar.component.scss']
})
export class FixedReferencesSnackbarComponent {
  constructor(public snackBarRef: MatSnackBarRef<FixedReferencesSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data: ReferenceRepair) { }
}
