import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TextImageLabel } from 'common/models/elements/element';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-label-edit-dialog',
  template: `
    <mat-dialog-content class="fx-column-start-stretch fx-fix-gap-20">
      <aspect-rich-text-editor-simple [(content)]="newLabel.text">
      </aspect-rich-text-editor-simple>

      <div *ngIf="newLabel.imgSrc !== undefined" class="fx-row-space-between-center">
        <div class="fx-column-start-stretch fx-fix-gap-10">
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
  styles: [`
    aspect-rich-text-editor-simple {
      margin-bottom: 20px;
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

    .fx-fix-gap-20 {
      gap: 20px;
    }

    .fx-fix-gap-10 {
      gap: 10px;
    }
  `]
})
export class LabelEditDialogComponent {
  newLabel = { ...this.data.label };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { label: TextImageLabel }) { }

  async loadImage(): Promise<void> {
    this.newLabel.imgSrc = await FileService.loadImage();
  }
}
