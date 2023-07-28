import { Directive, HostListener } from '@angular/core';
import { BaseTooltipDirective } from 'common/components/tooltip/base-tooltip.directive';

@Directive({
  selector: '[tooltipEventTooltip]',
  exportAs: 'TooltipEventTooltip'
})
export class TooltipEventTooltipDirective extends BaseTooltipDirective {
  @HostListener('pointerEnterTooltip', ['$event'])
  @HostListener('pointerDownTooltip', ['$event'])
  onPointerDown(event: CustomEvent): void {
    this.tooltipText = event.detail.tooltipText;
    this.tooltipPosition = event.detail.tooltipPosition;
    this.tooltipElement = event.target as HTMLElement;
    if (this.tooltipText && this.tooltipElement) {
      this.showTooltip();
    }
  }

  @HostListener('pointerLeaveTooltip')
  onPointerLeave(): void {
    this.hideTooltipWithDelay();
  }

  @HostListener('mouseLeaveTooltip')
  onMouseLeave(): void {
    this.hideTooltip();
  }
}
