import { Directive, HostListener } from '@angular/core';
import { BaseTooltipDirective } from 'common/directives/base-tooltip.directive';
import { TooltipPosition } from 'common/models/ui-element-interfaces';

// The rich text editor's tooltip extension builds this detail from two data attributes,
// each of which is absent whenever its value is empty (see extensions/tooltip.ts).
interface TooltipEventDetail {
  tooltipText: string | null;
  tooltipPosition: TooltipPosition | null;
}

@Directive({
  selector: '[tooltipEventTooltip]',
  exportAs: 'TooltipEventTooltip',
  standalone: false
})
export class TooltipEventTooltipDirective extends BaseTooltipDirective {
  @HostListener('pointerEnterTooltip', ['$event'])
  @HostListener('pointerDownTooltip', ['$event'])
  onPointerDown(event: Event): void {
    if (!isTooltipEvent(event)) {
      return;
    }
    this.tooltipText = event.detail.tooltipText ?? '';
    this.tooltipPosition = event.detail.tooltipPosition ?? 'below';
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

function isTooltipEvent(event: Event): event is CustomEvent<TooltipEventDetail> {
  return event instanceof CustomEvent && typeof event.detail === 'object' && event.detail !== null;
}
