import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { UnitUIElement } from '../../../../../../../common/unit';

@Component({
  selector: 'app-dynamic-canvas-overlay',
  template: `
    <div #draggableElement class="draggable-element" [class.draggable-element-selected]="selected"
         cdkDrag [cdkDragData]="{dragType: 'move', element: element}" [cdkDragDisabled]="!selected"
         (click)="click($event)" (dblclick)="openEditDialog()"
         [style.height.%]="100"
         [style.border]="selected ? '1px solid' : ''">
        <div *ngIf="selected" class="resizeHandle"
             cdkDrag [cdkDragData]="{dragType: 'resize', element: element}"
             (cdkDragStarted)="dragStart()" (cdkDragEnded)="dragEnd()" (cdkDragMoved)="resizeElement($event)"
             [style.right.px]="2" [style.bottom.px]="-3">
          <mat-icon>aspect_ratio</mat-icon>
          <div *cdkDragPlaceholder></div>
      </div>
      <ng-template #elementContainer></ng-template>
    </div>
  `,
  styles: [
    '.draggable-element {position: relative}',
    '.resizeHandle {position: absolute}'
  ]
})
export class DynamicCanvasOverlayComponent extends CanvasElementOverlay {
  @Input() dynamicPositioning!: boolean;
  @Output() resize = new EventEmitter<{ dragging: boolean, elementWidth?: number, elementHeight?: number }>();

  @ViewChild('draggableElement') dragElement!: ElementRef;
  private gridElementWidth: number = 0;
  private gridElementHeight: number = 0;

  dragStart(): void {
    this.gridElementWidth = this.dragElement.nativeElement.offsetWidth - 2;
    this.gridElementHeight = this.dragElement.nativeElement.offsetHeight - 2;

    this.resize.emit({
      dragging: true,
      elementWidth: this.dragElement.nativeElement.offsetWidth - 2,
      elementHeight: this.dragElement.nativeElement.offsetHeight - 2
    });
  }

  resizeElement(event: CdkDragMove<{ dragType: string; element: UnitUIElement }>): void {
    this.resize.emit({
      dragging: true,
      elementWidth: this.gridElementWidth + event.distance.x,
      elementHeight: this.gridElementHeight + event.distance.y
    });
  }

  dragEnd(): void {
    this.resize.emit({
      dragging: false
    });
  }
}
