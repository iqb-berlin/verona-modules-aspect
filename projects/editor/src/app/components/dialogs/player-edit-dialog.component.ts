// eslint-disable-next-line max-classes-per-file
import {
  Component, Inject, Pipe, PipeTransform
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
    selector: 'aspect-player-edit-dialog',
    template: `
    <mat-dialog-content [style.height.%]="90">
      <mat-tab-group>
        <mat-tab label="{{ 'player.appearance' | translate }}">
          <div class="fx-column-start-stretch">
            <mat-checkbox #startControl
                          [checked]="newPlayerConfig.startControl"
                          (change)="newPlayerConfig.startControl = $event.checked">
              {{ 'player.startControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [disabled]="!startControl.checked"
                          [checked]="newPlayerConfig.pauseControl"
                          (change)="newPlayerConfig.pauseControl = $event.checked">
              {{ 'player.pauseControl' | translate }}
            </mat-checkbox>
            <mat-checkbox #progressControl
                          [checked]="newPlayerConfig.progressBar"
                          (change)="newPlayerConfig.progressBar = $event.checked">
              {{ 'player.progressBar' | translate }}
            </mat-checkbox>
            <mat-checkbox [disabled]="!progressControl.checked"
                          [checked]="newPlayerConfig.interactiveProgressbar"
                          (change)="newPlayerConfig.interactiveProgressbar = $event.checked">
              {{ 'player.interactiveProgressbar' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.volumeControl"
                          (change)="newPlayerConfig.volumeControl = $event.checked">
              {{ 'player.volumeControl' | translate }}
            </mat-checkbox>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.defaultVolume' | translate }}</mat-label>
              <input matInput type="number" min="0" max="1" step="0.1"
                     [ngModel]="newPlayerConfig.defaultVolume"
                     (ngModelChange)="newPlayerConfig.defaultVolume = $event"
                     (change)="newPlayerConfig.defaultVolume = newPlayerConfig.defaultVolume ?
                                                               newPlayerConfig.defaultVolume : 0">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.minVolume' | translate }}</mat-label>
              <input matInput type="number" min="0" max="1" step="0.1"
                     [ngModel]="newPlayerConfig.minVolume"
                     (ngModelChange)="newPlayerConfig.minVolume = $event"
                     (change)="newPlayerConfig.minVolume = newPlayerConfig.minVolume ? newPlayerConfig.minVolume : 0">
            </mat-form-field>
            <mat-checkbox #muteControl
                          [checked]="newPlayerConfig.muteControl"
                          (change)="newPlayerConfig.muteControl = $event.checked">
              {{ 'player.muteControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [disabled]="!muteControl.checked"
                          [checked]="newPlayerConfig.interactiveMuteControl"
                          (change)="newPlayerConfig.interactiveMuteControl = $event.checked">
              {{ 'player.interactiveMuteControl' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.showRestTime"
                          (change)="newPlayerConfig.showRestTime = $event.checked">
              {{ 'player.showRestTime' | translate }}
            </mat-checkbox>
            <mat-checkbox [checked]="newPlayerConfig.showHint"
                          (change)="newPlayerConfig.showHint = $event.checked">
              {{ 'player.showHint' | translate }}
            </mat-checkbox>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.hintLabel' | translate }}</mat-label>
              <input matInput type="text"
                     [value]="newPlayerConfig.hintLabel"
                     [disabled]="!newPlayerConfig.showHint"
                     (input)="newPlayerConfig.hintLabel = $any($event.target).value">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.hintLabelDelay' | translate }}</mat-label>
              <input matInput type="number" step="1000" min="0"
                     [disabled]="!newPlayerConfig.showHint"
                     [ngModel]="newPlayerConfig.hintLabelDelay"
                     (ngModelChange)="newPlayerConfig.hintLabelDelay = $event"
                     (change)="newPlayerConfig.hintLabelDelay = newPlayerConfig.hintLabelDelay ?
                                                                newPlayerConfig.hintLabelDelay : 0">
            </mat-form-field>
          </div>
        </mat-tab>
        <mat-tab label="{{ 'player.behaviour' | translate }}">
          <div class="fx-column-start-stretch">
            <mat-checkbox [checked]="newPlayerConfig.autostart"
                          (change)="newPlayerConfig.autostart = $event.checked">
              {{ 'player.autoStart' | translate }}
            </mat-checkbox>
            <mat-form-field *ngIf="newPlayerConfig.autostart"
                            appearance="fill">
              <mat-label>{{ 'player.autoStartDelay' | translate }}</mat-label>
              <input matInput type="number" step="1000"
                     [ngModel]="newPlayerConfig.autostartDelay"
                     (ngModelChange)="newPlayerConfig.autostartDelay = $event"
                     (change)="newPlayerConfig.autostartDelay = newPlayerConfig.autostartDelay ?
                                                                newPlayerConfig.autostartDelay : 0">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.loop"
                          (change)="newPlayerConfig.loop = $event.checked">
              {{ 'player.loop' | translate }}
            </mat-checkbox>

            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.activeAfterID' | translate }}</mat-label>
              <mat-select [ngModel]="newPlayerConfig.activeAfterID"
                          (ngModelChange)="newPlayerConfig.activeAfterID = $event">
                <mat-option *ngFor="let mediaElement of (data.elementID | getValidAudioVideoAliasAndIDs)"
                            [value]="mediaElement.id">
                  {{mediaElement.alias}}
                </mat-option>
              </mat-select>
            </mat-form-field>mediaElement

            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.minRuns' | translate }}</mat-label>
              <input matInput type="number" min="0"
                     [ngModel]="newPlayerConfig.minRuns"
                     (ngModelChange)="newPlayerConfig.minRuns = $event"
                     (change)="newPlayerConfig.minRuns = newPlayerConfig.minRuns ? newPlayerConfig.minRuns : 0">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>{{ 'player.maxRuns' | translate }}</mat-label>
              <input matInput type="number" min="0"
                     [ngModel]="newPlayerConfig.maxRuns"
                     (ngModelChange)="newPlayerConfig.maxRuns = $event"
                     (change)="newPlayerConfig.maxRuns = newPlayerConfig.maxRuns ? newPlayerConfig.maxRuns : 0">
            </mat-form-field>
            <mat-checkbox [checked]="newPlayerConfig.showRestRuns"
                          (change)="newPlayerConfig.showRestRuns = $event.checked">
              {{ 'player.showRestRuns' | translate }}
            </mat-checkbox>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newPlayerConfig">{{ 'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-tab-group {
      height: 100%;
    }

    :host ::ng-deep .mat-mdc-tab-body-wrapper {
      margin-top: 10px;
      height: 100%;
    }
  `],
    standalone: false
})
export class PlayerEditDialogComponent {
  newPlayerConfig: PlayerProperties = { ...this.data.playerProps };
  constructor(@Inject(MAT_DIALOG_DATA)protected data: { elementID: string, playerProps: PlayerProperties }) {
  }
}

@Pipe({
    name: 'getValidAudioVideoAliasAndIDs',
    standalone: false
})
export class GetValidAudioVideoAliasAndIDsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(ignoreID: string): { id: string, alias: string }[] {
    const allAudioVideoAliasAndIDs = [
      ...this.unitService.unit.getAllElements('audio').map(audio => ({ id: audio.id, alias: audio.alias })),
      ...this.unitService.unit.getAllElements('video').map(video => ({ id: video.id, alias: video.alias }))];
    return allAudioVideoAliasAndIDs.filter(element => element.id !== ignoreID);
  }
}
