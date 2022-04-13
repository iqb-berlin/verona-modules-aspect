import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private _snackBar: MatSnackBar) {}

  showMessage(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000 });
  }

  showWarning(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000, panelClass: 'snackbar-warning' });
  }

  showError(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000, panelClass: 'snackbar-error' });
  }
}
