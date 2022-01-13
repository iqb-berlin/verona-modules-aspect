import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from '../../services/file.service';
import { LikertColumn } from '../../../../../common/models/uI-element';

@Component({
  selector: 'app-likert-column-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #textInput matInput type="text" [value]="data.column.text">
      </mat-form-field>
      <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
      <button mat-raised-button (click)="imgSrc = null">{{ 'removeImage' | translate }}</button>
      <img [src]="imgSrc"
           [style.object-fit]="'scale-down'"
           [width]="200">
      <mat-form-field appearance="fill">
        <mat-label>{{'position' | translate }}</mat-label>
        <mat-select #positionSelect [value]="data.column.position">
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
                         imgSrc: imgSrc,
                         position: positionSelect.value }">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class LikertColumnEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { column: LikertColumn }) { }
  imgSrc: string | null = this.data.column.imgSrc;

  async loadImage(): Promise<void> {
    this.imgSrc = await FileService.loadImage();
  }
}
