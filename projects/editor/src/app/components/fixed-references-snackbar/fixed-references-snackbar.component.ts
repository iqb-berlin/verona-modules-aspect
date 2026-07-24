import { Component, Inject, Optional } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-invalid-reference-elements-list-snackbar',
  standalone: false,
  templateUrl: './fixed-references-snackbar.component.html',
  styleUrls: ['./fixed-references-snackbar.component.scss']
})
export class FixedReferencesSnackbarComponent {
  constructor(public snackBarRef: MatSnackBarRef<FixedReferencesSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data: UIElement[]) { }
}
