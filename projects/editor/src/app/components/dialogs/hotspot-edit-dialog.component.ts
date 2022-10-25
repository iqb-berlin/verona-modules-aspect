import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hotspot } from 'common/models/elements/element';

@Component({
  selector: 'aspect-hotspot-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column" fxLayoutGap="10px">
      <div fxLayout="row" fxLayoutGap="10px">
        <mat-form-field appearance="fill" fxFlex="50">
          <mat-label>{{ 'hotspot.top' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.top">
        </mat-form-field>
        <mat-form-field appearance="fill" fxFlex="50">
          <mat-label>{{ 'hotspot.left' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.left">
        </mat-form-field>
      </div>
      <div fxLayout="row" fxLayoutGap="10px">
        <mat-form-field appearance="fill" fxFlex="50">
          <mat-label>{{ 'hotspot.width' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.width">
        </mat-form-field>
        <mat-form-field appearance="fill" fxFlex="50">
          <mat-label>{{ 'hotspot.height' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.height">
        </mat-form-field>
      </div>
      <div fxLayout="row" fxLayoutGap="10px" fxLayoutAlign="space-between center">
        <mat-radio-group [(ngModel)]="newHotspot.shape" fxFlex="50" fxLayout='column' fxLayoutGap="5px">
          <label>{{'hotspot.shape' | translate}}</label>
          <mat-radio-button value='ellipse'>{{'hotspot.ellipse' | translate}}</mat-radio-button>
          <mat-radio-button value='rect'>{{'hotspot.rect' | translate}}</mat-radio-button>
          <mat-radio-button value='triangle'>{{'hotspot.triangle' | translate}}</mat-radio-button>
        </mat-radio-group>
        <mat-form-field appearance="fill" fxFlex="50">
          <mat-label>{{ 'hotspot.borderWidth' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.borderWidth">
        </mat-form-field>
      </div>


      <div fxLayout="row" fxLayoutGap="10px">
        <mat-form-field appearance="fill" class="mdInput textsingleline">
          <mat-label>{{'hotspot.backgroundColor' | translate }}</mat-label>
          <input matInput type="text" [(ngModel)]="newHotspot.backgroundColor">
          <button mat-icon-button matSuffix (click)="backgroundColorInput.click()">
            <mat-icon>edit</mat-icon>
          </button>
        </mat-form-field>
        <input matInput type="color" hidden #backgroundColorInput [(ngModel)]="newHotspot.backgroundColor">

        <mat-form-field appearance="fill" class="mdInput textsingleline">
          <mat-label>{{'hotspot.borderColor' | translate }}</mat-label>
          <input matInput type="text" [(ngModel)]="newHotspot.borderColor">
          <button mat-icon-button matSuffix (click)="borderColorInput.click()">
            <mat-icon>edit</mat-icon>
          </button>
        </mat-form-field>
        <input matInput type="color" hidden #borderColorInput [(ngModel)]="newHotspot.borderColor">
      </div>

      <div fxLayout="row" fxLayoutGap="10px">
        <mat-form-field appearance="fill" fxFlex="50">
          <mat-label>{{ 'hotspot.rotation' | translate }}</mat-label>
          <input matInput type="number" min="0"
                 [(ngModel)]="newHotspot.rotation">
        </mat-form-field>
        <div fxFlex="50">
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
  `
})
export class HotspotEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { hotspot: Hotspot }) { }

  newHotspot = { ...this.data.hotspot };
}
