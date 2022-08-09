import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextImageLabel } from 'common/models/elements/element';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-label-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column" fxLayoutGap="20px">
      <aspect-rich-text-editor-simple [(content)]="newLabel.text">
      </aspect-rich-text-editor-simple>

      <div *ngIf="newLabel.imgSrc !== undefined" fxLayout="row" fxLayoutAlign="space-between center">
        <div fxLayout="column" fxLayoutGap="10px">
          <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
          <button mat-raised-button (click)="newLabel.imgSrc = null">{{ 'removeImage' | translate }}</button>
          <mat-form-field>
            <mat-label>{{'imagePosition' | translate }}</mat-label>
            <mat-select [value]="newLabel.imgPosition"
                        [disabled]="newLabel.imgSrc == null">
              <mat-option *ngFor="let option of ['above', 'below', 'left', 'right']"
                          [value]="option">
                {{ option | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <img [src]="newLabel.imgSrc"
             [style.object-fit]="'scale-down'"
             [width]="200">
      </div>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newLabel">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [
    'aspect-rich-text-editor-simple {margin-bottom: 20px;}'
  ]
})
export class LabelEditDialogComponent {
  newLabel = { ...this.data.label };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { label: TextImageLabel }) { }

  async loadImage(): Promise<void> {
    this.newLabel.imgSrc = await FileService.loadImage();
  }
}
