import {
  Component, Inject, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
import { ReferenceListComponent } from 'editor/src/app/components/reference-list/reference-list.component';

@Component({
  selector: 'aspect-reference-list-snackbar',
  imports: [
    ReferenceListComponent,
    MatSnackBarModule,
    MatButtonModule
  ],
  templateUrl: './reference-list-snackbar.component.html',
  styleUrls: ['./reference-list-snackbar.component.scss']
})
export class ReferenceListSnackbarComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(public snackBarRef: MatSnackBarRef<ReferenceListSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
