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
  hideDelay: number = 3000;
  private componentRef: ComponentRef<TooltipComponent> | null = null;

  constructor(protected viewContainerRef: ViewContainerRef) {}

  showTooltip(): void {
    if (!this.componentRef) {
      this.createComponent();
      this.setTooltipComponentProperties();
    }
  }

  hideTooltipWithDelay(): void {
    setTimeout(() => this.hideTooltip(), this.hideDelay);
  }

  hideTooltip(): void {
    this.destroyComponent();
  }

  private createComponent(): void {
    this.componentRef = this.viewContainerRef.createComponent(TooltipComponent);
    const domElem =
      (this.componentRef.hostView as EmbeddedViewRef<TooltipComponent>)
        .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  private setTooltipComponentProperties(): void {
    this.setTooltipText();
    this.setTooltipPosition();
  }

  private setTooltipText(): void {
    if (this.componentRef) {
      this.componentRef.instance.tooltipText = this.tooltipText;
    }
  }

  private setTooltipPosition(): void {
    if (this.componentRef) {
      this.componentRef.instance.tooltipPosition = this.tooltipPosition;
      const {
        left, right, top, bottom
      } = this.tooltipElement.getBoundingClientRect();
      switch (this.tooltipPosition) {
        case 'right': {
          this.componentRef.instance.left = Math.round(right);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        case 'left': {
          this.componentRef.instance.left = Math.round(left);
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2);
          break;
        }
        case 'above': {
          this.componentRef.instance.left = Math.round((right - left) / 2 + left);
          this.componentRef.instance.top = Math.round(top);
          break;
        }
        default: { // below
          this.componentRef.instance.left = Math.round((right - left) / 2 + left);
          this.componentRef.instance.top = Math.round(bottom);
          break;
        }
      }
    }
  }

  private destroyComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyComponent();
  }
}
