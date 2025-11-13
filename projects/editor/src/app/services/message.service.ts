// eslint-disable-next-line max-classes-per-file
import {
  Component, inject, Inject, Injectable, Input, Optional
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { UIElement } from 'common/models/elements/element';
import { ReferenceListComponent } from 'editor/src/app/components/reference-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef
} from '@angular/material/dialog';

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

  showErrorPrompt(error: Error): void {
    this.dialog.open(UnexpectedErrorComponent, {
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

@Component({
    selector: 'aspect-reference-list-snackbar',
    imports: [
        ReferenceListComponent,
        MatSnackBarModule,
        MatButtonModule
    ],
    template: `
    <div [style.padding.px]="16">
      <aspect-reference-list matSnackBarLabel [refs]="refs || data"></aspect-reference-list>
      <span matSnackBarActions>
        <button mat-stroked-button matSnackBarAction (click)="snackBarRef.dismiss()">
          Schließen
        </button>
      </span>
    </div>
  `,
    styles: [`
    button {
      color: var(--mat-snack-bar-button-color) !important;
      --mat-mdc-button-persistent-ripple-color: currentColor !important;
    }
    aspect-reference-list {color: var(--mat-snackbar-supporting-text-color);}
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
    imports: [
        NgIf,
        NgForOf,
        MatListModule,
        MatIconModule,
        MatSnackBarModule,
        MatButtonModule
    ],
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

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogActions,
    MatDialogContent
  ],
  template: `
    <h2 mat-dialog-title [style.color]="'red'">Unerwarteter Fehler</h2>
    <mat-dialog-content>
      <p><b>Es ist ein Fehler aufgetreten. Es kann zu schwerwiegenden Problemen kommen.</b><br>
      Das Problem kann halbautomatisiert gemeldet werden. Dazu bitte auch die Unit verlinken
      oder exportieren und an den Bericht anhängen.
      </p>
      <mat-form-field [style.width.px]="300">
        <mat-label>Fehler melden</mat-label>
        <mat-select>
          <mat-option (click)="reportErrorViaGitHub()">
            <mat-icon>open_in_new</mat-icon>
            Fehlerbericht auf GitHub erstellen
          </mat-option>
          <mat-option (click)="reportErrorViaEmail()">
            <mat-icon>outgoing_mail</mat-icon>
            Fehlerbericht als Email versenden
          </mat-option>
          <mat-option (click)="copyDetailsToClipboard()">
            <mat-icon>content_copy</mat-icon>
            Fehlerbericht in Zwischenablage kopieren
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button matButton (click)="dialogRef.close()">Verwerfen</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    `
  ]
})
export class UnexpectedErrorComponent {
  readonly dialogRef = inject(MatDialogRef<UnexpectedErrorComponent>);
  readonly data = inject<Error>(MAT_DIALOG_DATA);

  reportTitle: string;
  reportBody: string;

  constructor(private clipboard: Clipboard) {
    this.reportTitle = `Generierte Fehlermeldung: ${this.data.message}`;
    this.reportBody = encodeURIComponent(`${this.reportTemplate}
      ${this.data.stack}`);
  }

  reportErrorViaGitHub(): void {
    const baseURL = 'https://github.com/iqb-berlin/verona-modules-aspect/issues/new?template=fehlermeldung.md';
    window.open(`${baseURL}&title=${this.reportTitle}&body=${this.reportBody}`, '_blank');
  }

  reportErrorViaEmail() {
    window.location.href = `mailto:?subject=${this.reportTitle}&body=${this.reportBody}`;
  }

  copyDetailsToClipboard(): void {
    this.clipboard.copy(JSON.stringify(this.data.message + this.data.stack));
  }

  reportTemplate = `**Fehlerbeschreibung**
  Klare und kurze Beschreibung des Problems

  **Nachstellen**
  Schritte zum Nachstellen des Verhaltens:
  1. Lege Element '...' an
  2. Stelle Eigenschaft '....' auf Wert '...' ein
  3. Öffne Vorschau
  4. Fehlermeldung erscheint

  **Screenshots, Links**
  - Bei Links auf Aufgaben im Studio bitte darauf achten, dass diese für uns sichtbar sind.
  - Außerdem wäre es gut, wenn die Aufgaben sich auf das Darstellen des Problems beschränken und nicht voll mit anderen Dingen sind und wir erst die Stelle suchen müssen, die Probleme macht.

  Fehlermeldung:`;
}
