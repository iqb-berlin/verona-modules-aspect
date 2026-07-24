import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TooltipPosition } from 'common/interfaces';

@Component({
  selector: 'aspect-tooltip-properties-dialog',
  template: `
    <h2 mat-dialog-title>{{'propertiesPanel.tooltipText' | translate}}</h2>
    <mat-dialog-content>
      <div class="fx-column-start-stretch">
        <aspect-rich-text-editor [(content)]="tooltipText"
                                 [showReducedControls]="true"
                                 [controlPanelFolded]="false"
                                 [autoFocus]="true">
        </aspect-rich-text-editor>
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.tooltipPosition' | translate }}</mat-label>
          <mat-select [(ngModel)]="tooltipPosition">
            @for (option of ['left', 'right', 'above', 'below']; track option) {
              <mat-option [value]="option">
                {{ 'propertiesPanel.' + option | translate }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button
              [disabled]="!(tooltipText | hasTextContent)"
              [mat-dialog-close]="{ tooltipText, tooltipPosition, action: 'save' }">
        {{'save' | translate }}
      </button>
      @if (!newTooltip) {
        <button mat-button
                [mat-dialog-close]="{ tooltipText, tooltipPosition, action: 'delete' }">
          {{'delete' | translate }}
        </button>
      }
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    aspect-rich-text-editor {min-height: 200px; margin-bottom: 15px;}
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
