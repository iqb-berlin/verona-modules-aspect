import {
  ComponentRef, Directive, EmbeddedViewRef, Input, OnDestroy, ViewContainerRef
} from '@angular/core';
import { TooltipComponent } from 'common/components/tooltip/tooltip.component';
import { TooltipPosition } from 'common/models/elements/element';

@Directive()
export abstract class BaseTooltipDirective implements OnDestroy {
  @Input() tooltipText = '';
  @Input() tooltipPosition: TooltipPosition = 'below';
  tooltipElement!: HTMLElement;
  private hideDelay: number = 5000;
  private timeoutId: number | null = null;
  private componentRef: ComponentRef<TooltipComponent> | null = null;

  constructor(protected viewContainerRef: ViewContainerRef) {}

  showTooltip(): void {
    if (!this.componentRef) {
      this.createComponent();
      this.setTooltipComponentProperties();
    }
  }

  hideTooltipWithDelay(): void {
    this.timeoutId = setTimeout(() => this.hideTooltip(), this.hideDelay);
  }

  hideTooltip(): void {
    this.destroyComponent();
  }

  private createComponent(): void {
    this.componentRef = this.viewContainerRef.createComponent(TooltipComponent);
    document.body.appendChild(
      (this.componentRef.hostView as EmbeddedViewRef<TooltipComponent>)
        .rootNodes[0] as HTMLElement
    );
  }

  private setTooltipComponentProperties(): void {
    this.setTooltipText();
    // wait for rendering to get first tooltip dimensions
    setTimeout(() => this.setTooltipPosition(this.tooltipPosition));
  }

  private setTooltipText(): void {
    if (this.componentRef) {
      this.componentRef.instance.tooltipText = this.tooltipText;
    }
  }

  private setTooltipPosition(tooltipPosition: TooltipPosition): void {
    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    if (this.componentRef) {
      this.componentRef.instance.tooltipPosition = tooltipPosition;
      const {
        left, right, top, bottom
      } = this.tooltipElement.getBoundingClientRect();
      const verticalCenter = (bottom - top) / 2 + top;
      const horizontalCenter = (right - left) / 2 + left;
      const tooltipWidth = this.componentRef.instance.tooltip.nativeElement.offsetWidth;
      const tooltipHeight = this.componentRef.instance.tooltip.nativeElement.offsetHeight;
      switch (tooltipPosition) {
        case 'right': {
          this.setTooltipRight(tooltipHeight, tooltipWidth, verticalCenter, right);
          break;
        }
        case 'left': {
          this.setTooltipLeft(tooltipHeight, tooltipWidth, verticalCenter, left);
          break;
        }
        case 'above': {
          this.setTooltipAbove(tooltipHeight, tooltipWidth, horizontalCenter, top);
          break;
        }
        default: { // below
          this.setTooltipBelow(tooltipHeight, tooltipWidth, horizontalCenter, bottom);
          break;
        }
      }
    }
  }

  private setTooltipRight(tooltipHeight: number, tooltipWidth: number, verticalCenter: number, right: number): void {
    const topPos = BaseTooltipDirective.getTopPosition(verticalCenter, tooltipHeight);
    if (right + tooltipWidth > document.body.offsetWidth) {
      this.componentRef!.instance.maxWidth = `${document.body.offsetWidth - right}px`;
      setTimeout(() => {
        const toolTipInnerWidth = this.componentRef!.instance.tooltip.nativeElement.children[0].offsetWidth;
        if (right + toolTipInnerWidth > document.body.offsetWidth) {
          this.componentRef!.instance.left = Math.round(document.body.offsetWidth - toolTipInnerWidth - 10);
          const newToolTipInnerHeight = this.componentRef!.instance.tooltip.nativeElement.children[0].offsetHeight;
          const newTopPos = BaseTooltipDirective.getTopPosition(verticalCenter, newToolTipInnerHeight);
          this.componentRef!.instance.top = Math.round(newTopPos);
        }
      });
    }
    this.setPosition(right, topPos);
  }

  private setTooltipLeft(tooltipHeight: number, tooltipWidth: number, verticalCenter: number, left: number): void {
    const leftPos = left - tooltipWidth < 0 ? 0 : left - tooltipWidth;
    const topPos = BaseTooltipDirective.getTopPosition(verticalCenter, tooltipHeight);
    if (left - tooltipWidth < 0) {
      this.componentRef!.instance.maxWidth = `${left}px`;
      setTimeout(() => {
        const newToolTipInnerHeight = this.componentRef!.instance.tooltip.nativeElement.children[0].offsetHeight;
        const newTopPos = BaseTooltipDirective.getTopPosition(verticalCenter, newToolTipInnerHeight);
        this.componentRef!.instance.top = Math.round(newTopPos);
      });
    }
    this.setPosition(leftPos, topPos);
  }

  private setTooltipAbove(tooltipHeight: number, tooltipWidth: number, horizontalCenter: number, top: number): void {
    const leftPos = horizontalCenter < (tooltipWidth / 2) ? 0 : horizontalCenter - (tooltipWidth / 2);
    const topPos = top - tooltipHeight < 5 ? 5 : top - tooltipHeight - 5;
    this.setPosition(leftPos, topPos);
  }

  private setTooltipBelow(tooltipHeight: number, tooltipWidth: number, horizontalCenter: number, bottom: number): void {
    const leftPos = horizontalCenter < (tooltipWidth / 2) ? 0 : horizontalCenter - (tooltipWidth / 2);
    const topPos = bottom + tooltipHeight + 5 > document.body.offsetHeight ?
      document.body.offsetHeight - tooltipHeight - 5 : bottom + 5;
    this.setPosition(leftPos, topPos);
  }

  private static getTopPosition(verticalCenter: number, tooltipHeight: number): number {
    if (verticalCenter < (tooltipHeight / 2)) {
      return 5;
    }
    if (verticalCenter + (tooltipHeight / 2) > document.body.offsetHeight) {
      return document.body.offsetHeight - tooltipHeight - 5;
    }
    return verticalCenter - (tooltipHeight / 2);
  }

  private setPosition(left: number, top: number): void {
    this.componentRef!.instance.left = Math.round(left);
    this.componentRef!.instance.top = Math.round(top);
  }

  private destroyComponent(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyComponent();
  }
}
