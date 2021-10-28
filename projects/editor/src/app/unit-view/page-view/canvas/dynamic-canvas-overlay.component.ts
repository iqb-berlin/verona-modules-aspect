import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { UIElement } from '../../../../../../common/models/uI-element';

@Component({
  selector: 'app-dynamic-canvas-overlay',
  template: `
      <div #draggableElement class="draggable-element" [class.draggable-element-selected]="isSelected"
           cdkDrag [cdkDragData]="{dragType: 'move', element: element}" [cdkDragDisabled]="!isSelected"
           (click)="selectElement($event.shiftKey)" (dblclick)="openEditDialog()"
           (cdkDragStarted)="!isSelected && selectElement()"
           [style.outline]="isSelected ? 'purple solid 1px' : ''">
          <div *ngIf="isSelected"
               [style.width.%]="dragging ? 100 : 0"
               [style.height.%]="dragging ? 100 : 0"
               cdkDrag [cdkDragData]="{dragType: 'resize', element: element}"
               (cdkDragStarted)="dragStart()" (cdkDragEnded)="dragEnd()" (cdkDragMoved)="resizeElement($event)">
              <div class="resizeHandle">
               <mat-icon>aspect_ratio</mat-icon>
                <div *cdkDragPlaceholder></div>
              </div>
          </div>
          <ng-template #elementContainer></ng-template>
      </div>
      <div [style.position]="'relative'"
           [style.width.px]="dragging ? elementWidth : 0"
           [style.height.px]="dragging ? elementHeight : 0"
           [style.border]="'1px solid purple'">
      </div>
  `,
  styles: [
    '.draggable-element {position: relative; width: 100%; height: 100%}',
    '.resizeHandle {position: absolute; right: 3px; bottom: 3px; z-index: 1; height: 25px}',
    '.cdk-drag {position: absolute; bottom: 0; right: 0}'
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

  dragStart(): void {
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

  resizeElement(event: CdkDragMove<{ dragType: string; element: UIElement }>): void {
    this.dragging = true;
    this.elementWidth = this.gridElementWidth + event.distance.x;
    this.elementHeight = this.gridElementHeight + event.distance.y;
    this.resize.emit({
      dragging: true,
      elementWidth: this.gridElementWidth + event.distance.x,
      elementHeight: this.gridElementHeight + event.distance.y
    });
  }

  dragEnd(): void {
    this.dragging = false;
    this.resize.emit({
      dragging: false
    });
  }
}
