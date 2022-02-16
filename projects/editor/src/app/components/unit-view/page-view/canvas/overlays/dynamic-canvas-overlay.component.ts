import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { UIElement } from '../../../../../../../../common/models/uI-element';

@Component({
  selector: 'aspect-dynamic-canvas-overlay',
  template: `
    <!-- TabIndex is needed to make the div selectable and catch keyboard events (delete). -->
    <!-- DragStart and DragEnd are part of a cursor hack to style the body. See global styling file. -->
    <div #draggableElement class="draggable-element"
         [class.fixed-size-content-wrapper]="element.positionProps?.dynamicPositioning &&
            element.positionProps?.fixedSize"
         [class.temporaryHighlight]="temporaryHighlight"
         [style.display]="dragging ? 'none' : ''"
         tabindex="-1"
         cdkDrag [cdkDragData]="{dragType: 'move', element: element}"
         (click)="selectElement($event.shiftKey); $event.stopPropagation()" (dblclick)="openEditDialog()"
         (cdkDragStarted)="moveDragStart()"
         (cdkDragEnded)="moveDragEnd()"
         [style.outline]="isSelected ? 'purple solid 1px' : ''"
         [style.z-index]="isSelected ? 2 : 1">
      <div *cdkDragPlaceholder></div>
      <div *ngIf="isSelected"
           [style.width.%]="dragging ? 100 : 0"
           [style.height.%]="dragging ? 100 : 0"
           cdkDrag [cdkDragData]="{dragType: 'resize', element: element}"
           (cdkDragStarted)="resizeDragStart()" (cdkDragEnded)="resizeDragEnd()"
           (cdkDragMoved)="resizeDragMove($event)">
        <div class="resizeHandle">
          <mat-icon>aspect_ratio</mat-icon>
          <div *cdkDragPlaceholder></div>
        </div>
      </div>
      <ng-template #elementContainer></ng-template>
    </div>
    <div class="resize-preview"
         [style.position]="'relative'"
         [style.width.px]="dragging ? elementWidth : 0"
         [style.height.px]="dragging ? elementHeight : 0"
         [style.border]="'1px dashed purple'">
    </div>
  `,
  styles: [
    '.draggable-element {position: relative; width: 100%; height: 100%}',
    '.draggable-element:active {cursor: grabbing}',
    '.resizeHandle {position: absolute; right: 3px; bottom: 3px; z-index: 1; height: 25px}',
    '.resizeHandle {cursor: nwse-resize}',
    '.cdk-drag {position: absolute; bottom: 0; right: 0}',
    '.temporaryHighlight {z-index: 100}'
  ]
})
export class DynamicCanvasOverlayComponent extends CanvasElementOverlay {
  @Input() dynamicPositioning!: boolean;
  @Output() resize = new EventEmitter<{ dragging: boolean, elementWidth?: number, elementHeight?: number }>();

  @ViewChild('draggableElement') dragElement!: ElementRef;
  private gridElementWidth: number = 0;
  private gridElementHeight: number = 0;
  elementWidth: number = 0;
  elementHeight: number = 0;

  dragging = false;

  bodyElement: HTMLElement = document.body;

  resizeDragStart(): void {
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'nwse-resize';
    this.dragging = true;
    this.gridElementWidth = this.dragElement.nativeElement.offsetWidth - 2;
    this.gridElementHeight = this.dragElement.nativeElement.offsetHeight - 2;
    this.elementWidth = this.dragElement.nativeElement.offsetWidth - 2;
    this.elementHeight = this.dragElement.nativeElement.offsetHeight - 2;

    this.resize.emit({
      dragging: true,
      elementWidth: this.dragElement.nativeElement.offsetWidth - 2,
      elementHeight: this.dragElement.nativeElement.offsetHeight - 2
    });
  }

  resizeDragMove(event: CdkDragMove<{ dragType: string; element: UIElement }>): void {
    this.dragging = true;
    this.elementWidth = this.gridElementWidth + event.distance.x;
    this.elementHeight = this.gridElementHeight + event.distance.y;
    this.resize.emit({
      dragging: true,
      elementWidth: this.gridElementWidth + event.distance.x,
      elementHeight: this.gridElementHeight + event.distance.y
    });
  }

  resizeDragEnd(): void {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
    this.dragging = false;
    this.resize.emit({
      dragging: false
    });
  }

  moveDragStart(): void {
    this.selectElement();
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'move';
  }

  moveDragEnd(): void {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }
}
