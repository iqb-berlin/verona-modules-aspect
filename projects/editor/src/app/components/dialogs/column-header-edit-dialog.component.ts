import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from '../../services/file.service';
import { ColumnHeader } from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-likert-column-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <aspect-rich-text-editor-simple [content]="data.column.text"
                                      [defaultFontSize]="data.defaultFontSize"
                                      (contentChange)="this.textContent = $event">
      </aspect-rich-text-editor-simple>

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
                         text: textContent,
                         imgSrc: imgSrc,
                         position: positionSelect.value }">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [
    'aspect-rich-text-editor-simple {margin-bottom: 20px;}'
  ]
})
export class ColumnHeaderEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { column: ColumnHeader, defaultFontSize: number }) { }
  textContent: string = this.data.column.text;
  imgSrc: string | null = this.data.column.imgSrc;

  async loadImage(): Promise<void> {
    this.imgSrc = await FileService.loadImage();
  }
}
