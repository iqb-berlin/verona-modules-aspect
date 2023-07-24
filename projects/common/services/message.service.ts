// eslint-disable-next-line max-classes-per-file
import {
  Component, Inject, Injectable, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { UIElement } from 'common/models/elements/element';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private _snackBar: MatSnackBar) {}

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

@Component({
  selector: 'aspect-invalid-reference-elements-list-snackbar',
  template: `
    Invalide Referenzen bei folgenden <br> Elementen wurden entfernt:
    <mat-list>
      <mat-list-item *ngFor="let element of data">
        <mat-icon *ngIf="element.type == 'drop-list'" matListItemIcon>
          drag_indicator
        </mat-icon>
        <div *ngIf="element.type == 'drop-list'" matListItemTitle>
          Ablegeliste: {{element.id}}
        </div>
        <mat-icon *ngIf="element.type == 'button'" matListItemIcon>
          smart_button
        </mat-icon>
        <div *ngIf="element.type == 'button'" matListItemTitle>
          Knopf: {{element.id}}
        </div>
        <mat-icon *ngIf="element.type == 'audio'" matListItemIcon>
          volume_up
        </mat-icon>
        <div *ngIf="element.type == 'audio'" matListItemTitle>
          Audio: {{element.id}}
        </div>
      </mat-list-item>
    </mat-list>
    <span matSnackBarActions>
      <button mat-stroked-button matSnackBarAction (click)="snackBarRef.dismiss()">
        Schließen
      </button>
    </span>
  `,
  styles: [`
    :host {font-size: large;}
    button {
      color: var(--mat-snack-bar-button-color) !important;
      --mat-mdc-button-persistent-ripple-color: currentColor !important;
    }
    mat-icon {color: inherit !important;}
    .mat-mdc-list-item-title {color: inherit !important;}
    `
  ]
})
export class FixedReferencesSnackbarComponent {
  constructor(public snackBarRef: MatSnackBarRef<FixedReferencesSnackbarComponent>,
              @Optional()@Inject(MAT_SNACK_BAR_DATA) public data: UIElement[]) { }
}
