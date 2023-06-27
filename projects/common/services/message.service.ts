import {
  Component, Inject, Injectable, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/services/reference-manager';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private _snackBar: MatSnackBar) {}

  showMessage(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000 });
  }

  showSuccess(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000, panelClass: 'snackbar-success' });
  }

  showWarning(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000, panelClass: 'snackbar-warning' });
  }

  showError(text: string): void {
    this._snackBar.open(text, undefined, { duration: 3000, panelClass: 'snackbar-error' });
  }

  showPrompt(text: string): void {
    this._snackBar.open(text, 'OK', { panelClass: 'snackbar-error' });
  }

  showReferencePanel(refs: any[]): void {
    this._snackBar.openFromComponent(ReferenceListSnackbarComponent, {
      data: refs,
      horizontalPosition: 'left'
    });
  }
}

@Component({
  selector: 'aspect-reference-list-snackbar',
  template: `
    <aspect-reference-list matSnackBarLabel [refs]="refs || data"></aspect-reference-list>
    <span matSnackBarActions>
      <button mat-stroked-button matSnackBarAction (click)="snackBarRef.dismiss()">
        Schließen
      </button>
    </span>
  `,
  styles: [`
    button {
      color: var(--mat-snack-bar-button-color) !important;
      --mat-mdc-button-persistent-ripple-color: currentColor !important;
    }
    `
  ]
})
export class ReferenceListSnackbarComponent {
  @Input() refs: ReferenceList[] | undefined;

  constructor(public snackBarRef: MatSnackBarRef<ReferenceListSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data?: ReferenceList[]) { }
}
