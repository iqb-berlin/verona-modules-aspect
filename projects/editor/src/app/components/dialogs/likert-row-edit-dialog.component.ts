import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { TextLabel } from 'common/models/elements/element';

@Component({
  selector: 'aspect-likert-row-edit-dialog',
  template: `
    <mat-dialog-content class="fx-column-start-stretch">
      <aspect-rich-text-editor-simple [(content)]="newLikertRow.rowLabel.text">
      </aspect-rich-text-editor-simple>

      <mat-form-field [style.margin-top.px]="15">
        <mat-label>{{'id' | translate }}</mat-label>
        <input matInput type="text" [(ngModel)]="newLikertRow.id">
      </mat-form-field>

      <mat-checkbox [(ngModel)]="newLikertRow.readOnly">
        {{'propertiesPanel.readOnly' | translate }}
      </mat-checkbox>

      <mat-form-field appearance="fill">
        <mat-label>{{'preset' | translate }}</mat-label>
        <mat-select [(ngModel)]="newLikertRow.value">
          <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
          <mat-option *ngFor="let column of data.options; let i = index" [value]="i"
                      [innerHTML]="'<span>' + column.text + ' (Index: ' + i + ')</span>' | safeResourceHTML">
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>{{'verticalButtonAlignment' | translate }}</mat-label>
        <mat-select [(ngModel)]="newLikertRow.verticalButtonAlignment">
          <mat-option *ngFor="let option of ['auto', 'center']"
                      [value]="option">
            {{ option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div class="fx-row-space-between-center">
        <div class="fx-column-start-stretch fx-fix-gap-10">
          <button mat-raised-button (click)="loadImage()">
            {{ 'loadImage' | translate }}</button>
          <button mat-raised-button (click)="newLikertRow.rowLabel.imgSrc = null">
            {{ 'removeImage' | translate }}</button>
          <mat-form-field>
            <mat-label>{{'imagePosition' | translate }}</mat-label>
            <mat-select [(ngModel)]="newLikertRow.rowLabel.imgPosition">
              <mat-option *ngFor="let option of ['above', 'below', 'left', 'right']"
                          [value]="option">
                {{ option | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <img [src]="newLikertRow.rowLabel.imgSrc"
             [style.object-fit]="'scale-down'" [width]="200">
      </div>

    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newLikertRow">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
     mat-checkbox {
       margin-bottom: 15px;
     }

     .fx-column-start-stretch {
       box-sizing: border-box;
       display: flex;
       flex-direction: column;
       justify-content: flex-start;
       align-items: stretch;
     }

     .fx-row-space-between-center {
       box-sizing: border-box;
       display: flex;
       flex-direction: row;
       justify-content: space-between;
       align-items: center;
     }

     .fx-fix-gap-10 {
       gap: 10px;
     }
  `]
})
export class LikertRowEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { row: LikertRowElement, options: TextLabel[] }) { }

  newLikertRow = {
    ...this.data.row,
    rowLabel: { ...this.data.row.rowLabel }
  };

  async loadImage(): Promise<void> {
    this.newLikertRow.rowLabel.imgSrc = await FileService.loadImage();
  }
}
