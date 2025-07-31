import { Component, Input } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ConnectedPosition, Overlay, RepositionScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'aspect-print-label',
  templateUrl: './print-label.component.html',
  styleUrl: './print-label.component.scss'
})
export class PrintLabelComponent {
  @Input() elementComponent!: ElementComponent;

  protected scrollStrategy: RepositionScrollStrategy;

  constructor(private overlay: Overlay) {
    this.scrollStrategy = this.overlay.scrollStrategies.reposition();
  }

  overlayPositions: ConnectedPosition[] = [{
    originX: 'start',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: 15
  }];
}
