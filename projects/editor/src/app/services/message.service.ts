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

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private _snackBar: MatSnackBar, private dialog: MatDialog) {}

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

  showPrompt(text: string): void {
    this._snackBar.open(text, 'OK', { panelClass: 'snackbar-error' });
  }

  showReferencePanel(refs: ReferenceList[]): void {
    this._snackBar.openFromComponent(ReferenceListSnackbarComponent, {
      data: refs,
      horizontalPosition: 'left'
    });
  }

  showFixedReferencePanel(refs: UIElement[]): void {
    this._snackBar.openFromComponent(FixedReferencesSnackbarComponent, {
      data: refs,
      horizontalPosition: 'left'
    });
  }
}
