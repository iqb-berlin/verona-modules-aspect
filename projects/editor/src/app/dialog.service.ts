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
      width: '370px',
      height: '510px',
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
      <mat-tab-group>
        <mat-tab label="{{ 'player.appearance' | translate }}">
          <div fxLayout="column">
            <mat-checkbox [checked]="newPlayerConfig.startControl || data.player.startControl"
                          (change)="newPlayerConfig.startControl = $event.checked">
              {{ 'player.startControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.pauseControl || data.player.pauseControl"
                          (change)="newPlayerConfig.pauseControl = $event.checked">
              {{ 'player.pauseControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.progressBar || data.player.progressBar"
                          (change)="newPlayerConfig.progressBar = $event.checked">
              {{ 'player.progressBar' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.interactiveProgressbar || data.player.interactiveProgressbar"
                          (change)="newPlayerConfig.interactiveProgressbar = $event.checked">
              {{ 'player.interactiveProgressbar' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.volumeControl || data.player.volumeControl"
                          (change)="newPlayerConfig.volumeControl = $event.checked">
              {{ 'player.volumeControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.showRestTime || data.player.showRestTime"
                          (change)="newPlayerConfig.showRestTime = $event.checked">
              {{ 'player.showRestTime' | translate }}
            </mat-checkbox>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.hintLabel' | translate }}</mat-label>
              <input matInput type="text" [value]="newPlayerConfig.hintLabel || data.player.hintLabel"
                     (input)="newPlayerConfig.hintLabel = $any($event.target).value">
            </mat-form-field>
            <mat-form-field *ngIf="newPlayerConfig.hintLabel !== ''" appearance="fill">
              <mat-label>{{ 'player.hintLabelDelay' | translate }}</mat-label>
              <input matInput type="number" [value]="newPlayerConfig.hintLabelDelay"
                     (input)="newPlayerConfig.hintLabelDelay = $any($event.target).value">
            </mat-form-field>
          </div>
        </mat-tab>
        <mat-tab label="{{ 'player.behaviour' | translate }}">
          <div fxLayout="column">
            <mat-checkbox [checked]="newPlayerConfig.autostart || data.player.autostart"
                          (change)="newPlayerConfig.autostart = $event.checked">
              {{ 'player.autoStart' | translate }}
            </mat-checkbox>
            <mat-form-field *ngIf="newPlayerConfig.autostart" appearance="fill">
              <mat-label>Autostart Verzögerung</mat-label>
              <input matInput type="number" [value]="newPlayerConfig.autostartDelay || data.player.autostartDelay"
                     (input)="newPlayerConfig.autostartDelay = $any($event.target).value">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.loop || data.player.loop"
                          (change)="newPlayerConfig.loop = $event.checked">
              {{ 'player.loop' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.uninterruptible || data.player.uninterruptible"
                          (change)="newPlayerConfig.uninterruptible = $event.checked">
              {{ 'player.uninterruptible' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.hideOtherPages || data.player.hideOtherPages"
                          (change)="newPlayerConfig.hideOtherPages = $event.checked">
              {{ 'player.hideOtherPages' | translate }}
            </mat-checkbox>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.activeAfterID' | translate }}</mat-label>
              <input matInput type="text" [value]="newPlayerConfig.activeAfterID || data.player.activeAfterID"
                     (input)="newPlayerConfig.activeAfterID = $any($event.target).value">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.minRuns' | translate }}</mat-label>
              <input matInput type="number" [value]="newPlayerConfig.minRuns || data.player.minRuns"
                     (input)="newPlayerConfig.minRuns = $any($event.target).value">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.maxRuns' | translate }}</mat-label>
              <input matInput type="number" [value]="newPlayerConfig.maxRuns || data.player.maxRuns"
                     (input)="newPlayerConfig.maxRuns = $any($event.target).value">
            </mat-form-field>
          </div>
        </mat-tab>
      </mat-tab-group>
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
export class PlayerEditDialog {
  newPlayerConfig: PlayerElement = {} as PlayerElement;
  constructor(@Inject(MAT_DIALOG_DATA)public data: { player: PlayerElement }) {
  }
}
