import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { DragNDropValueObject } from 'common/interfaces/elements';

@Component({
  selector: 'aspect-drop-list-option-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #textField matInput type="text" [value]="data.value.stringValue">
      </mat-form-field>
      <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
      <button mat-raised-button (click)="imgSrc = undefined">{{ 'removeImage' | translate }}</button>
      <img [src]="imgSrc"
           [style.object-fit]="'scale-down'"
           [width]="200">
      <mat-form-field>
        <mat-label>{{'id' | translate }}</mat-label>
        <input #idField matInput type="text" [value]="data.value.id">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{
        stringValue: textField.value,
        imgSrcValue: imgSrc,
        id: idField.value
      } ">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class DropListOptionEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { value: DragNDropValueObject }) { }
  imgSrc: string | undefined = this.data.value.imgSrcValue;

  async loadImage(): Promise<void> {
    this.imgSrc = await FileService.loadImage();
  }
}
