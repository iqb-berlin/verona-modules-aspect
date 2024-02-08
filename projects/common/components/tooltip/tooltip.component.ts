import { Component, ElementRef, ViewChild } from '@angular/core';
import { TooltipPosition } from 'common/models/elements/element';

@Component({
  selector: 'aspect-tooltip',
  template: `
    <div #tooltip
         class="tooltip"
         [style.left.px]="left"
         [style.top.px]="top"
         [style.max-width]="maxWidth">
      <div #tooltipInner
           class="tooltip-text">
        {{tooltipText}}
      </div>
    </div>
  `,
  styleUrls: ['./tooltip.component.scss']
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
