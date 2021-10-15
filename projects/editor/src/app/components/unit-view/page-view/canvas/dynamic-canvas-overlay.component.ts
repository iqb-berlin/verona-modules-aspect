import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { UIElement } from '../../../../../../../common/models/uI-element';

@Component({
  selector: 'app-dynamic-canvas-overlay',
  template: `
      <div #draggableElement class="draggable-element" [class.draggable-element-selected]="isSelected"
           cdkDrag [cdkDragData]="{dragType: 'move', element: element}" [cdkDragDisabled]="!isSelected"
           (click)="selectElement($event.shiftKey)" (dblclick)="openEditDialog()"
           (cdkDragStarted)="!isSelected && selectElement()"
           [style.height.%]="100"
           [style.border]="isSelected ? '1px solid' : ''">
          <div *ngIf="isSelected" class="resizeHandle"
               cdkDrag [cdkDragData]="{dragType: 'resize', element: element}"
               (cdkDragStarted)="dragStart()" (cdkDragEnded)="dragEnd()" (cdkDragMoved)="resizeElement($event)"
               cdkDragBoundary=".section-wrapper"
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

  resizeElement(event: CdkDragMove<{ dragType: string; element: UIElement }>): void {
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
