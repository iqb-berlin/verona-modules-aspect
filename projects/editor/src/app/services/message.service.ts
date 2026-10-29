import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  UnexpectedErrorComponent
} from 'editor/src/app/components/unexpected-error/unexpected-error.component';

/**
 * Everything the editor says to its user in passing: four snackbars that fade after three seconds and
 * differ only in their colour, one with a button that leads on, and one dialog.
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

  /**
   * A warning that leads somewhere: its button takes the author to what it is about. It fades like the others, a
   * little later, because what it announces stays reachable elsewhere. Emits when the button is pressed.
   */
  showWarningWithAction(text: string, action: string, duration: number = 6000): Observable<void> {
    return this._snackBar.open(text, action, { duration: duration, panelClass: 'snackbar-warning' }).onAction();
  }
}
