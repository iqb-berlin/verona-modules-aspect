import { Component, Input } from '@angular/core';
import { CanvasElementOverlay } from './canvas-element-overlay';

@Component({
  selector: 'app-dynamic-canvas-overlay',
  template: `
    <div class="draggable-element" [class.draggable-element-selected]="selected"
         cdkDrag [cdkDragData]="this.element" [cdkDragDisabled]="!selected"
         (click)="click($event)"
         (dblclick)="openEditDialog()"
         [style.height.%]="100">
      <ng-template #elementContainer></ng-template>
    </div>
  `
})
export class DynamicCanvasOverlayComponent extends CanvasElementOverlay {
  @Input() dynamicPositioning!: boolean;
}
