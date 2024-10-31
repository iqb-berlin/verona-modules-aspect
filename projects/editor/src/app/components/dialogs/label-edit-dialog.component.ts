import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { TextImageLabel } from 'common/interfaces';

@Component({
  selector: 'aspect-label-edit-dialog',
  template: `
    <mat-dialog-content class="fx-column-start-stretch" >
      <aspect-rich-text-editor [(content)]="newLabel.text" [showReducedControls]="true">
      </aspect-rich-text-editor>

      <div *ngIf="newLabel.imgSrc !== undefined" class="image-panel">
        <div class="fx-column-start-stretch" [style.gap.px]="10">
          <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
          <button mat-raised-button (click)="newLabel.imgSrc = null">{{ 'removeImage' | translate }}</button>
          <mat-form-field>
            <mat-label>{{'imagePosition' | translate }}</mat-label>
            <mat-select [(ngModel)]="newLabel.imgPosition"
                        [disabled]="newLabel.imgSrc == null">
              <mat-option *ngFor="let option of ['above', 'below', 'left', 'right']"
                          [value]="option">
                {{ option | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <aspect-text-image-panel [label]="newLabel" [style.justify-content]="'center'"></aspect-text-image-panel>
      </div>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newLabel">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    aspect-rich-text-editor {min-height: 200px;}
    .image-panel {
      display: flex;
      margin-top: 20px;
    }

    .image-panel aspect-text-image-panel {
      margin-left: auto;
      margin-right: auto;
    }
  `]
})
export class LabelEditDialogComponent {
  newLabel = { ...this.data.label };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { label: TextImageLabel }) { }

  async loadImage(): Promise<void> {
    await FileService.loadImage().then(image => {
      this.newLabel.imgSrc = image.content;
      this.newLabel.imgFileName = image.name;
    });
  }
}
