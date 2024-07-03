import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { TextLabel } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-likert-row-edit-dialog',
  template: `
    <mat-dialog-content>
      <div class="fx-column-start-stretch">
        <aspect-rich-text-editor [(content)]="newLikertRow.rowLabel.text" [showReducedControls]="true">
        </aspect-rich-text-editor>

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
            <mat-select-trigger
              [innerHTML]="newLikertRow.value !== null ?
                '<span>' + data.options[$any(newLikertRow.value)].text + '</span>' : 'undefiniert' | safeResourceHTML">
            </mat-select-trigger>
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
          <div class="fx-column-start-stretch" [style.gap.px]="10">
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
          <aspect-text-image-panel [label]="newLikertRow.rowLabel"
                                   [style.justify-content]="'center'"></aspect-text-image-panel>
        </div>
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

     aspect-text-image-panel {
       margin-left: auto;
       margin-right: auto;
     }
  `]
})
export class LikertRowEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { row: LikertRowElement, options: TextLabel[] }) { }

  newLikertRow = new LikertRowElement({
    ...this.data.row,
    rowLabel: { ...this.data.row.rowLabel }
  });

  async loadImage(): Promise<void> {
    this.newLikertRow.rowLabel.imgSrc = await FileService.loadImage();
  }
}
