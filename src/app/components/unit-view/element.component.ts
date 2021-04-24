import {
  Directive, Output, EventEmitter, Input
} from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { UnitUIElement } from '../../model/unit';

@Directive()
export abstract class ElementComponent {
  @Input() element!: UnitUIElement;
  @Input() canvasSize!: [number, number];
  @Output() elementSelected = new EventEmitter<UnitUIElement>();

  drop(event: CdkDragEnd): void {
    this.element.xPosition += event.distance.x;
    if (this.element.xPosition < 0) {
      this.element.xPosition = 0;
    }
    if (this.element.xPosition > this.canvasSize[0]) {
      this.element.xPosition = this.canvasSize[0] - this.element.width;
    }
    this.element.yPosition += event.distance.y;
    if (this.element.yPosition < 0) {
      this.element.yPosition = 0;
    }
    if (this.element.yPosition > this.canvasSize[1]) {
      this.element.yPosition = this.canvasSize[1] - this.element.height;
    }
  }
}
