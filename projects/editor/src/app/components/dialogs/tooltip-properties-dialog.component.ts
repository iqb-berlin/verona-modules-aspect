import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TooltipPosition } from 'common/interfaces';

@Component({
    selector: 'aspect-tooltip-properties-dialog',
    template: `
    <mat-dialog-content>
      <div class="fx-column-start-stretch">
        <mat-form-field>
          <mat-label>{{'propertiesPanel.tooltipText' | translate}}</mat-label>
          <input matInput
                 [(ngModel)]="tooltipText">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.tooltipPosition' | translate }}</mat-label>
          <mat-select [(ngModel)]="tooltipPosition">
            <mat-option *ngFor="let option of ['left', 'right', 'above', 'below']"
                        [value]="option">
              {{ 'propertiesPanel.' + option | translate }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button
              [disabled]="!tooltipText"
              [mat-dialog-close]="{ tooltipText, tooltipPosition, action: 'save' }">
        {{'save' | translate }}
      </button>
      <button *ngIf="!newTooltip"
              mat-button
              [mat-dialog-close]="{ tooltipText, tooltipPosition, action: 'delete' }">
        {{'delete' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
    standalone: false
})
export class TooltipPropertiesDialogComponent {
  tooltipText: string;
  tooltipPosition: TooltipPosition;
  newTooltip: boolean;
  constructor(@Inject(MAT_DIALOG_DATA) private data: {
    tooltipText: string | undefined
    tooltipPosition: TooltipPosition | undefined
  }) {
    this.tooltipText = data.tooltipText || '';
    this.tooltipPosition = data.tooltipPosition || 'below';
    this.newTooltip = data.tooltipText === undefined || data.tooltipPosition === undefined;
  }
}
