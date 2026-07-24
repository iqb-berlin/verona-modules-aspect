import { Component, Inject, Optional } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-invalid-reference-elements-list-snackbar',
  imports: [
    NgIf,
    NgForOf,
    MatListModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule
  ],
  templateUrl: './fixed-references-snackbar.component.html',
  styleUrls: ['./fixed-references-snackbar.component.scss']
})
export class FixedReferencesSnackbarComponent {
  constructor(public snackBarRef: MatSnackBarRef<FixedReferencesSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data: UIElement[]) { }
}
