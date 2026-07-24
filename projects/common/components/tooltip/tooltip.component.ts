import { Component, ElementRef, ViewChild } from '@angular/core';
import { TooltipPosition } from 'common/interfaces';

@Component({
  selector: 'aspect-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  standalone: false
})
export class TooltipComponent {
  tooltipText: string = '';
  tooltipPosition: TooltipPosition = 'below';
  left: number = 0;
  top: number = 0;
  maxWidth: string = '30%';

  @ViewChild('tooltip') tooltip!: ElementRef;
  @ViewChild('tooltip') tooltipInner!: ElementRef;
}
