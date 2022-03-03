import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private static instance: MessageService;

  constructor(private _snackBar: MatSnackBar) {
    MessageService.instance = this;
  }

  static getInstance(): MessageService {
    return MessageService.instance;
  }

  showWarning(text: string): void {
    this._snackBar.open(text, undefined, { duration: 2000, panelClass: 'snackbar-warning' });
  }

  showError(text: string): void {
    this._snackBar.open(text, undefined, { duration: 2000, panelClass: 'snackbar-error' });
  }
}
