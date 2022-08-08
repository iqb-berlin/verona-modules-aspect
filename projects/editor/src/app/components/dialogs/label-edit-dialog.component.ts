// eslint-disable-next-line max-classes-per-file
import {
  Component, Inject, Pipe, PipeTransform
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Label, TextImageLabel } from 'common/models/elements/element';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-label-edit-dialog',
  template: `
    <mat-dialog-content>
      <div>
        <aspect-rich-text-editor-simple [(content)]="newLabel.text">
        </aspect-rich-text-editor-simple>
      </div>

      <mat-divider [style.margin.px]="15"></mat-divider>

      <div *ngIf="newLabel.imgSrc !== undefined" fxLayout="row" fxLayoutAlign="space-between center" >
        <div fxLayout="column" fxLayoutGap="10px">
          <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
          <button mat-raised-button (click)="newLabel.imgSrc = null">{{ 'removeImage' | translate }}</button>
          <mat-form-field>
            <mat-label>{{'imagePosition' | translate }}</mat-label>
            <mat-select #positionSelect [value]="newLabel.imgPosition"
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
  `
})
export class LabelEditDialogComponent {
  newLabel = { ...this.data.label };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { label: TextImageLabel }) { }

  async loadImage(): Promise<void> {
    this.newLabel.imgSrc = await FileService.loadImage();
  }
}

@Pipe({
  name: 'saveLabel'
})
export class SaveLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(labelText: string, label: Label): Label {
    return { ...label, text: labelText };
  }
}
