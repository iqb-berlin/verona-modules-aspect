import {
  Directive, ElementRef, HostListener, ViewContainerRef
} from '@angular/core';
import { BaseTooltipDirective } from 'common/components/tooltip/base-tooltip.directive';

@Directive({
    selector: '[pointerEventTooltip]',
    exportAs: 'PointerEventTooltip',
    standalone: false
})
export class PointerEventTooltipDirective extends BaseTooltipDirective {
  @HostListener('pointerenter')
  @HostListener('pointerdown')
  onPointerDown(): void {
    this.tooltipElement = this.elementRef.nativeElement;
    if (this.tooltipText && this.tooltipElement) {
      this.showTooltip();
    }
  }

  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.tooltipElement = this.elementRef.nativeElement;
    this.hideTooltipWithDelay();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.tooltipElement = this.elementRef.nativeElement;
    this.hideTooltip();
  }

  constructor(protected viewContainerRef: ViewContainerRef,
              private elementRef: ElementRef) {
    super(viewContainerRef);
  }
}
