import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';

@Component({
    selector: 'aspect-hotspot-edit-dialog',
    template: `
    <mat-dialog-content class="fx-column-start-stretch fx-fix-gap-10">
      <div class="fx-row-start-stretch fx-fix-gap-10">
        <mat-form-field class="fx-flex-50" appearance="fill">
          <mat-label>{{ 'hotspot.top' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.top"
                 (change)="newHotspot.top = newHotspot.top ? newHotspot.top : 0">
        </mat-form-field>
        <mat-form-field class="fx-flex-50"  appearance="fill">
          <mat-label>{{ 'hotspot.left' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.left"
                 (change)="newHotspot.left = newHotspot.left ? newHotspot.left : 0">
        </mat-form-field>
      </div>
      <div class="fx-row-start-stretch fx-fix-gap-10">
        <mat-form-field class="fx-flex-50"  appearance="fill">
          <mat-label>{{ 'hotspot.width' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.width"
                 (change)="newHotspot.width = newHotspot.width ? newHotspot.width : 0">
        </mat-form-field>
        <mat-form-field class="fx-flex-50" appearance="fill">
          <mat-label>{{ 'hotspot.height' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.height"
                 (change)="newHotspot.height = newHotspot.height ? newHotspot.height : 0">
        </mat-form-field>
      </div>
      <div class="fx-row-space-between-center fx-fix-gap-10">
        <mat-radio-group [(ngModel)]="newHotspot.shape"
                         class="fx-column-start-stretch fx-flex-50" [style.gap.px]="5">
          <label>{{'hotspot.shape' | translate}}</label>
          <mat-radio-button value='ellipse'>{{'hotspot.ellipse' | translate}}</mat-radio-button>
          <mat-radio-button value='rectangle'>{{'hotspot.rectangle' | translate}}</mat-radio-button>
          <mat-radio-button value='triangle'>{{'hotspot.triangle' | translate}}</mat-radio-button>
        </mat-radio-group>
        <mat-form-field class="fx-flex-50" appearance="fill">
          <mat-label>{{ 'hotspot.borderWidth' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.borderWidth"
                 (change)="newHotspot.borderWidth = newHotspot.borderWidth ? newHotspot.borderWidth : 0">
        </mat-form-field>
      </div>


      <div class="fx-row-start-stretch fx-fix-gap-10">
        <mat-form-field appearance="fill" class="mdInput textsingleline fx-flex-50">
          <mat-label>{{'hotspot.backgroundColor' | translate }}</mat-label>
          <input matInput type="text" [(ngModel)]="newHotspot.backgroundColor">
          <button mat-icon-button matSuffix (click)="backgroundColorInput.click()">
            <mat-icon>edit</mat-icon>
          </button>
        </mat-form-field>
        <input matInput type="color" hidden #backgroundColorInput [(ngModel)]="newHotspot.backgroundColor">

        <mat-form-field appearance="fill" class="mdInput textsingleline fx-flex-50">
          <mat-label>{{'hotspot.borderColor' | translate }}</mat-label>
          <input matInput type="text" [(ngModel)]="newHotspot.borderColor">
          <button mat-icon-button matSuffix (click)="borderColorInput.click()">
            <mat-icon>edit</mat-icon>
          </button>
        </mat-form-field>
        <input matInput type="color" hidden #borderColorInput [(ngModel)]="newHotspot.borderColor">
      </div>

      <div class="fx-row-start-stretch fx-fix-gap-10">
        <mat-form-field  class="fx-flex-50" appearance="fill">
          <mat-label>{{ 'hotspot.rotation' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.rotation"
                 (change)="newHotspot.rotation = newHotspot.rotation ? newHotspot.rotation : 0">
        </mat-form-field>
        <div  class="fx-flex-50">
          <mat-checkbox [checked]="newHotspot.value"
                        (change)="newHotspot.value = $event.checked">
            {{ 'hotspot.value' | translate }}
          </mat-checkbox>
          <mat-checkbox [checked]="newHotspot.readOnly"
                        (change)="newHotspot.readOnly = $event.checked">
            {{ 'hotspot.readOnly' | translate }}
          </mat-checkbox>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newHotspot">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .fx-fix-gap-10 {
      gap: 10px;
    }

    .fx-flex-50 {
      flex: 1 1 100%;
      box-sizing: border-box;
      max-width: 50%;
    }
  `],
    standalone: false
})
export class HotspotEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { hotspot: Hotspot }) { }

  newHotspot = { ...this.data.hotspot };
}
