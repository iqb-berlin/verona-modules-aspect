import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TooltipPosition } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-tooltip-properties-dialog',
  templateUrl: './tooltip-properties-dialog.component.html',
  styleUrls: ['./tooltip-properties-dialog.component.scss'],
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
