import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { TextImageLabel } from 'common/models/elements/element';

@Component({
  selector: 'aspect-likert-row-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #textField matInput type="text" [value]="data.row.rowLabel.text">
      </mat-form-field>

      <mat-form-field>
        <mat-label>{{'id' | translate }}</mat-label>
        <input #idField matInput type="text" [value]="data.row.id">
      </mat-form-field>

      <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
      <button mat-raised-button (click)="imgSrc = null">{{ 'removeImage' | translate }}</button>
      <img [src]="imgSrc"
           [style.object-fit]="'scale-down'"
           [width]="200">

      <mat-form-field appearance="fill">
        <mat-label>{{'imagePosition' | translate }}</mat-label>
        <mat-select #positionSelect [value]="data.row.rowLabel.position">
          <mat-option *ngFor="let option of ['above', 'below', 'left', 'right']"
                      [value]="option">
            {{ option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>{{'verticalButtonAlignment' | translate }}</mat-label>
        <mat-select #verticalButtonAlignmentSelect [value]="data.row.verticalButtonAlignment">
          <mat-option *ngFor="let option of ['auto', 'center']"
                      [value]="option">
            {{ option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>{{'preset' | translate }}</mat-label>
        <mat-select #valueField [value]="data.row.value">
          <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
          <mat-option *ngFor="let column of data.columns; let i = index" [value]="i + 1">
            {{column.text}} (Index: {{i + 1}})
          </mat-option>
        </mat-select>
      </mat-form-field>

    <mat-checkbox #readOnlyField [checked]="data.row.readOnly">
      {{'propertiesPanel.readOnly' | translate }}
    </mat-checkbox>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button
              [mat-dialog-close]="{
                rowLabel: {
                  text: textField.value,
                  imgSrc: imgSrc,
                  position: positionSelect.value
                },
                id: idField.value,
                value: valueField.value,
                verticalButtonAlignment: verticalButtonAlignmentSelect.value,
                readOnly: readOnlyField.value
              }">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class LikertRowEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { row: LikertRowElement, columns: TextImageLabel[] }) { }
  imgSrc: string | null = this.data.row.rowLabel.imgSrc;

  async loadImage(): Promise<void> {
    this.imgSrc = await FileService.loadImage();
  }
}
