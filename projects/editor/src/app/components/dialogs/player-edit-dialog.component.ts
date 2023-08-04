import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-player-edit-dialog',
  template: `
    <mat-dialog-content [style.height.%]="90">
      <mat-tab-group>
        <mat-tab label="{{ 'player.appearance' | translate }}">
          <div class="fx-column-start-stretch">
            <mat-checkbox #startControl
                          [checked]="newPlayerConfig.startControl || data.playerProps.startControl"
                          (change)="newPlayerConfig.startControl = $event.checked">
              {{ 'player.startControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [disabled]="!startControl.checked"
                          [checked]="newPlayerConfig.pauseControl || data.playerProps.pauseControl"
                          (change)="newPlayerConfig.pauseControl = $event.checked">
              {{ 'player.pauseControl' | translate }}
            </mat-checkbox>
            <mat-checkbox #progressControl
                          [checked]="newPlayerConfig.progressBar || data.playerProps.progressBar"
                          (change)="newPlayerConfig.progressBar = $event.checked">
              {{ 'player.progressBar' | translate }}
            </mat-checkbox>
            <mat-checkbox [disabled]="!progressControl.checked"
                          [checked]="newPlayerConfig.interactiveProgressbar || data.playerProps.interactiveProgressbar"
                          (change)="newPlayerConfig.interactiveProgressbar = $event.checked">
              {{ 'player.interactiveProgressbar' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.volumeControl || data.playerProps.volumeControl"
                          (change)="newPlayerConfig.volumeControl = $event.checked">
              {{ 'player.volumeControl' | translate }}
            </mat-checkbox>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.defaultVolume' | translate }}</mat-label>
              <input matInput type="number" min="0" max="1" step="0.1"
                     [ngModel]="newPlayerConfig.defaultVolume || data.playerProps.defaultVolume"
                     (ngModelChange)="newPlayerConfig.defaultVolume = $event">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.minVolume' | translate }}</mat-label>
              <input matInput type="number" min="0" max="1" step="0.1"
                     [ngModel]="newPlayerConfig.minVolume || data.playerProps.minVolume"
                     (ngModelChange)="newPlayerConfig.minVolume = $event">
            </mat-form-field>
            <mat-checkbox #muteControl
                          [checked]="newPlayerConfig.muteControl || data.playerProps.muteControl"
                          (change)="newPlayerConfig.muteControl = $event.checked">
              {{ 'player.muteControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [disabled]="!muteControl.checked"
                          [checked]="newPlayerConfig.interactiveMuteControl || data.playerProps.interactiveMuteControl"
                          (change)="newPlayerConfig.interactiveMuteControl = $event.checked">
              {{ 'player.interactiveMuteControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.showRestTime || data.playerProps.showRestTime"
                          (change)="newPlayerConfig.showRestTime = $event.checked">
              {{ 'player.showRestTime' | translate }}
            </mat-checkbox>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.hintLabel' | translate }}</mat-label>
              <input matInput type="text" [value]="newPlayerConfig.hintLabel || data.playerProps.hintLabel"
                     (input)="newPlayerConfig.hintLabel = $any($event.target).value">
            </mat-form-field>
            <mat-form-field *ngIf="newPlayerConfig.hintLabel || data.playerProps.hintLabel"
                            appearance="fill">
              <mat-label>{{ 'player.hintLabelDelay' | translate }}</mat-label>
              <input matInput type="number" step="1000" min="0"
                     [ngModel]="newPlayerConfig.hintLabelDelay || data.playerProps.hintLabelDelay"
                     (ngModelChange)="newPlayerConfig.hintLabelDelay = $event">
            </mat-form-field>
          </div>
        </mat-tab>
        <mat-tab label="{{ 'player.behaviour' | translate }}">
          <div class="fx-column-start-stretch">
            <mat-checkbox [checked]="newPlayerConfig.autostart || data.playerProps.autostart"
                          (change)="newPlayerConfig.autostart = $event.checked">
              {{ 'player.autoStart' | translate }}
            </mat-checkbox>
            <mat-form-field *ngIf="newPlayerConfig.autostart || data.playerProps.autostart" appearance="fill">
              <mat-label>{{ 'player.autoStartDelay' | translate }}</mat-label>
              <input matInput type="number" step="1000"
                     [ngModel]="newPlayerConfig.autostartDelay || data.playerProps.autostartDelay"
                     (ngModelChange)="newPlayerConfig.autostartDelay = $event">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.loop || data.playerProps.loop"
                          (change)="newPlayerConfig.loop = $event.checked">
              {{ 'player.loop' | translate }}
            </mat-checkbox>

            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.activeAfterID' | translate }}</mat-label>
              <mat-select [ngModel]="newPlayerConfig.activeAfterID || data.playerProps.activeAfterID"
                          (ngModelChange)="newPlayerConfig.activeAfterID = $event">
                <mat-option *ngFor="let id of (data.elementID | getValidAudioVideoIDs)" [value]="id">
                  {{id}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.minRuns' | translate }}</mat-label>
              <input matInput type="number" min="0"
                     [ngModel]="newPlayerConfig.minRuns || data.playerProps.minRuns"
                     (ngModelChange)="newPlayerConfig.minRuns = $event">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.maxRuns' | translate }}</mat-label>
              <input matInput type="number" min="0"
                     [ngModel]="newPlayerConfig.maxRuns || data.playerProps.maxRuns"
                     (ngModelChange)="newPlayerConfig.maxRuns = $event">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.showRestRuns || data.playerProps.showRestRuns"
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
    `,
  styles: [`
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }

    mat-tab-group {
      height: 100%;
    }

    :host ::ng-deep .mat-mdc-tab-body-wrapper {
      margin-top: 10px;
      height: 100%;
    }
  `]
})
export class PlayerEditDialogComponent {
  newPlayerConfig: PlayerProperties = {} as PlayerProperties;
  constructor(@Inject(MAT_DIALOG_DATA)public data: { elementID: string, playerProps: PlayerProperties }) {
  }
}

@Pipe({
  name: 'getValidAudioVideoIDs'
})
export class GetValidAudioVideoIDsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(ignoreID: string): string[] {
    const allAudioVideoIDs: string[] = [
      ...this.unitService.unit.getAllElements('audio').map(audio => audio.id),
      ...this.unitService.unit.getAllElements('video').map(video => video.id)];
    return allAudioVideoIDs.filter(elementID => elementID !== ignoreID);
  }
}
