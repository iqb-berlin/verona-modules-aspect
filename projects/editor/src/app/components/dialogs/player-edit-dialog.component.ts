import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerElement } from '../../../../../common/interfaces/UIElementInterfaces';

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
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.defaultVolume' | translate }}</mat-label>
              <input matInput type="number" min="0" max="1" step="0.1"
                     [ngModel]="newPlayerConfig.defaultVolume || data.player.defaultVolume"
                     (ngModelChange)="newPlayerConfig.defaultVolume = $event">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.minVolume' | translate }}</mat-label>
              <input matInput type="number" min="0" max="1" step="0.1"
                     [ngModel]="newPlayerConfig.minVolume || data.player.minVolume"
                     (ngModelChange)="newPlayerConfig.minVolume = $event">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.muteControl || data.player.muteControl"
                          (change)="newPlayerConfig.muteControl = $event.checked">
              {{ 'player.muteControl' | translate }}
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
            <mat-form-field *ngIf="newPlayerConfig.hintLabel || data.player.hintLabel"
                            appearance="fill">
              <mat-label>{{ 'player.hintLabelDelay' | translate }}</mat-label>
              <input matInput type="number" step="1000" min="0"
                     [ngModel]="newPlayerConfig.hintLabelDelay || data.player.hintLabelDelay"
                     (ngModelChange)="newPlayerConfig.hintLabelDelay = $event">
            </mat-form-field>
          </div>
        </mat-tab>
        <mat-tab label="{{ 'player.behaviour' | translate }}">
          <div fxLayout="column">
            <mat-checkbox [checked]="newPlayerConfig.autostart || data.player.autostart"
                          (change)="newPlayerConfig.autostart = $event.checked">
              {{ 'player.autoStart' | translate }}
            </mat-checkbox>
            <mat-form-field *ngIf="newPlayerConfig.autostart || data.player.autostart" appearance="fill">
              <mat-label>{{ 'player.autoStartDelay' | translate }}</mat-label>
              <input matInput type="number" step="1000"
                     [value]="newPlayerConfig.autostartDelay || data.player.autostartDelay"
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
              <input matInput type="number" min="0"
                     [ngModel]="newPlayerConfig.minRuns || data.player.minRuns"
                     (ngModelChange)="newPlayerConfig.minRuns = $event">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.maxRuns' | translate }}</mat-label>
              <input matInput type="number" min="0"
                     [ngModel]="newPlayerConfig.maxRuns || data.player.maxRuns"
                     (ngModelChange)="newPlayerConfig.maxRuns = $event">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.showRestRuns || data.player.showRestRuns"
                          (change)="newPlayerConfig.showRestRuns = $event.checked">
              {{ 'player.showRestRuns' | translate }}
            </mat-checkbox>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newPlayerConfig">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
    `
})
export class PlayerEditDialogComponent {
  newPlayerConfig: PlayerElement = {} as PlayerElement;
  constructor(@Inject(MAT_DIALOG_DATA)public data: { player: PlayerElement }) {
  }
}
