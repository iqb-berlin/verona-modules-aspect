import { Component } from '@angular/core';
import { TooltipPosition } from 'common/models/elements/element';

@Component({
  selector: 'aspect-tooltip',
  template: `
    <div class="tooltip"
         [ngClass]="['tooltip--'+tooltipPosition]"
         [style.left.px]="left"
         [style.top.px]="top">
      {{tooltipText}}
    </div>
  `,
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  tooltipText: string = '';
  tooltipPosition: TooltipPosition = 'below';
  left: number = 0;
  top: number = 0;
}
