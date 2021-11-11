import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LikertColumn } from '../../../../../common/interfaces/UIElementInterfaces';
import { FileService } from '../../../../../common/file.service';

@Component({
  selector: 'app-likert-column-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #textInput matInput type="text" [value]="data.column.text">
      </mat-form-field>
      <input #imageUpload type="file" hidden (click)="loadImage()">
      <button mat-raised-button (click)="imageUpload.click()">{{ 'loadImage' | translate }}</button>
      <button mat-raised-button (click)="data.column.imgSrc = null">{{ 'removeImage' | translate }}</button>
      <img [src]="data.column.imgSrc"
           [style.object-fit]="'scale-down'"
           [width]="200">
      <mat-form-field appearance="fill">
        <mat-label>{{'position' | translate }}</mat-label>
        <mat-select [value]="data.column.position"
                    (selectionChange)="this.data.column.position = $event.value">
          <mat-option *ngFor="let option of ['above', 'below']"
                      [value]="option">
            {{ option | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{
                         text: textInput.value,
                         imgSrc: data.column.imgSrc,
                         position: data.column.position }">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class LikertColumnEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { column: LikertColumn }) { }

  async loadImage(): Promise<void> {
    this.data.column.imgSrc = await FileService.loadImage();
  }
}
