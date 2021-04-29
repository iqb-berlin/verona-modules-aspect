import {
  Directive, Output, EventEmitter, Input
} from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { UnitUIElement } from '../../model/unit';

@Directive()
export abstract class ElementComponent {
  @Input() elementModel!: UnitUIElement;
  @Input() canvasSize!: [number, number];
  @Output() elementSelected = new EventEmitter<{ componentElement: ElementComponent, multiSelect: boolean }>();

  @Input() selected = false;

  select(event: MouseEvent): void {
    if (event.shiftKey) {
      this.elementSelected.emit({ componentElement: this, multiSelect: true });
    } else {
      this.elementSelected.emit({ componentElement: this, multiSelect: false });
    }
  }

  drop(event: CdkDragEnd): void {
    this.elementModel.xPosition += event.distance.x;
    if (this.elementModel.xPosition < 0) {
      this.elementModel.xPosition = 0;
    }
    if (this.elementModel.xPosition > this.canvasSize[0]) {
      this.elementModel.xPosition = this.canvasSize[0] - this.elementModel.width;
    }
    this.elementModel.yPosition += event.distance.y;
    if (this.elementModel.yPosition < 0) {
      this.elementModel.yPosition = 0;
    }
    if (this.elementModel.yPosition > this.canvasSize[1]) {
      this.elementModel.yPosition = this.canvasSize[1] - this.elementModel.height;
    }
  }
}
