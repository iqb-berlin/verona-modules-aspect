import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
import { UIElement } from 'common/models/elements/element';
import {
  ReferenceListSnackbarComponent
} from 'editor/src/app/components/reference-list-snackbar/reference-list-snackbar.component';
import {
  FixedReferencesSnackbarComponent
} from 'editor/src/app/components/fixed-references-snackbar/fixed-references-snackbar.component';
import {
  UnexpectedErrorComponent
} from 'editor/src/app/components/unexpected-error/unexpected-error.component';

/**
 * Everything the editor says to its user in passing: four snackbars that fade after three seconds and
 * differ only in their colour, one that waits for an OK, two that carry a component and stay until they
 * are closed, and one dialog.
 *
 * The service passes on the text it is given, unchanged and untranslated.
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private _snackBar: MatSnackBar, private dialog: MatDialog) {}

  /** A plain note, gone after three seconds unless another duration is given. */
  showMessage(text: string, duration: number = 3000): void {
    this._snackBar.open(text, undefined, { duration: duration });
  }

  showSuccess(text: string, duration: number = 3000): void {
    this._snackBar.open(text, undefined, { duration: duration, panelClass: 'snackbar-success' });
  }

  showWarning(text: string, duration: number = 3000): void {
    this._snackBar.open(text, undefined, { duration: duration, panelClass: 'snackbar-warning' });
  }

  showError(text: string, duration: number = 3000): void {
    this._snackBar.open(text, undefined, { duration: duration, panelClass: 'snackbar-error' });
  }

  showErrorPrompt(error: Error): MatDialogRef<UnexpectedErrorComponent> {
    return this.dialog.open(UnexpectedErrorComponent, {
      data: error
    });
  }

  /** A message that stays until it is acknowledged: no duration, and an OK button to dismiss it. */
  showPrompt(text: string): void {
    this._snackBar.open(text, 'OK', { panelClass: 'snackbar-error' });
  }

  /** Lists what still points at something the author wants to delete -- the panel that explains why a
      deletion was refused. Stays until it is closed. */
  showReferencePanel(refs: ReferenceList[]): void {
    this._snackBar.openFromComponent(ReferenceListSnackbarComponent, {
      data: refs,
      horizontalPosition: 'left'
    });
  }

  /** Lists the references that were repaired along the way, so the author sees what changed without
      having asked for it. */
  showFixedReferencePanel(refs: UIElement[]): void {
    this._snackBar.openFromComponent(FixedReferencesSnackbarComponent, {
      data: refs,
      horizontalPosition: 'left'
    });
  }
}
