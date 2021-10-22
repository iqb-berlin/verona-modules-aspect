// eslint-disable-next-line max-classes-per-file
import { Component, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PlayerElement } from '../../../common/interfaces/UIElementInterfaces';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showConfirmDialog(text: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialog, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showMultilineTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(MultilineTextEditDialog, {
      width: '600px',
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showRichTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialog, {
      width: '800px',
      height: '700px',
      data: {
        text: text
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showPlayerEditDialog(player: PlayerElement): Observable<PlayerElement> {
    const dialogRef = this.dialog.open(PlayerEditDialog, {
      width: '470px',
      height: '520px',
      data: {
        player: player
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <mat-dialog-content>
        {{data.text}}
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class ConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Text</mat-label>
        <input #inputElement matInput type="text" [value]="data.text">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class TextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-multiline-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field [style.width.%]="100">
        <mat-label>Text</mat-label>
        <textarea #inputElement matInput type="text" [value]="data.text">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class MultilineTextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-rich-text-edit-dialog-tinymce',
  template: `
    <mat-dialog-content>
      <app-rich-text-editor [(text)]="data.text"></app-rich-text-editor>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.text">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class RichTextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-player-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="row">
      <div class="property-column" fxLayout="column">
        <mat-checkbox [checked]="newPlayerConfig.autostart"
                      (change)="newPlayerConfig.autostart = $event.checked">
          Autostart
        </mat-checkbox>
        <mat-form-field *ngIf="newPlayerConfig.autostart" appearance="fill">
          <mat-label>Autostart Verzögerung</mat-label>
          <input matInput type="number" [value]="newPlayerConfig.autostartDelay"
                 (input)="newPlayerConfig.autostartDelay = $any($event.target).value">
        </mat-form-field>
        <mat-checkbox [checked]="newPlayerConfig.loop"
                      (change)="newPlayerConfig.loop = $event.checked">
          Loop
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.startControl"
                      (change)="newPlayerConfig.startControl = $event.checked">
          startControl
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.pauseControl"
                      (change)="newPlayerConfig.pauseControl = $event.checked">
          pauseControl
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.stopControl"
                      (change)="newPlayerConfig.stopControl = $event.checked">
          stopControl
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.progressBar"
                      (change)="newPlayerConfig.progressBar = $event.checked">
          progressBar
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.interactiveProgressbar"
                      (change)="newPlayerConfig.interactiveProgressbar = $event.checked">
          interactiveProgressbar
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.volumeControl"
                      (change)="newPlayerConfig.volumeControl = $event.checked">
          volumeControl
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.uninterruptible"
                      (change)="newPlayerConfig.uninterruptible = $event.checked">
          uninterruptible
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.hideOtherPages"
                      (change)="newPlayerConfig.hideOtherPages = $event.checked">
          hideOtherPages
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.showRestRuns"
                      (change)="newPlayerConfig.showRestRuns = $event.checked">
          showRestRuns
        </mat-checkbox>
        <mat-checkbox [checked]="newPlayerConfig.showRestTime"
                      (change)="newPlayerConfig.showRestTime = $event.checked">
          showRestTime
        </mat-checkbox>
      </div>
      <div fxLayout="column">
        <mat-form-field appearance="fill">
          <mat-label>hintLabel</mat-label>
          <input matInput type="text" [value]="newPlayerConfig.hintLabel"
                 (input)="newPlayerConfig.hintLabel = $any($event.target).value">
        </mat-form-field>
        <mat-form-field *ngIf="newPlayerConfig.hintLabel !== ''" appearance="fill">
          <mat-label>hintLabelDelay</mat-label>
          <input matInput type="number" [value]="newPlayerConfig.hintLabelDelay"
                 (input)="newPlayerConfig.hintLabelDelay = $any($event.target).value">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>activeAfter</mat-label>
          <input matInput type="text" [value]="newPlayerConfig.activeAfter"
                 (input)="newPlayerConfig.activeAfter = $any($event.target).value">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>minRuns</mat-label>
          <input matInput type="number" [value]="newPlayerConfig.minRuns"
                 (input)="newPlayerConfig.minRuns = $any($event.target).value">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>maxRuns</mat-label>
          <input matInput type="number" [value]="newPlayerConfig.maxRuns"
                 (input)="newPlayerConfig.maxRuns = $any($event.target).value">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newPlayerConfig">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `,
  styles: [
    'mat-dialog-content {min-height: 410px}',
    '.property-column {margin-right: 20px}'
  ]
})
export class PlayerEditDialog { // TODO return only changed values, so not all the properties have to be overwritten
  newPlayerConfig: PlayerElement;
  constructor(@Inject(MAT_DIALOG_DATA)public data: { player: PlayerElement }) {
    this.newPlayerConfig = data.player;
  }
}
