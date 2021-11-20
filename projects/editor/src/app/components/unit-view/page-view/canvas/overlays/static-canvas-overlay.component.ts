import { Component } from '@angular/core';
import { take } from 'rxjs/operators';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { CanvasElementOverlay } from './canvas-element-overlay';
import { UIElement } from '../../../../../../../../common/models/uI-element';

@Component({
  selector: 'app-static-canvas-overlay',
  template: `
    <!-- Is also a droplist to catch the resize drop and not let it bubble up to the canvas drop handler. -->
    <!-- TabIndex is needed to make the div selectable and catch keyboard events (delete). -->
    <div class="draggable-element" [class.draggable-element-selected]="isSelected"
         cdkDrag [cdkDragData]="{dragType: 'move', element: element}"
         (click)="selectElement($event.shiftKey); $event.stopPropagation()"
         (cdkDragStarted)="!isSelected && selectElement()"
         (dblclick)="openEditDialog()"
         (keyup.delete)="deleteSelectedElements()" tabindex="-1"
         cdkDropList>
      <div *cdkDragPlaceholder></div>
      <!-- Needs extra div because styling can interfere with drag and drop-->
      <div [style.position]="'absolute'"
           [style.outline]="isSelected ? 'purple solid 1px' : ''"
           [style.left.px]="element.xPosition"
           [style.top.px]="element.yPosition"
           [style.z-index]="element.zIndex">
        <div *ngIf="isSelected" class="resizeHandle"
             cdkDrag (cdkDragStarted)="resizeDragStart()"
             (cdkDragMoved)="resizeElement($event)"
             (cdkDragEnded)="updateModel($event)"
             cdkDragBoundary=".section-wrapper"
             [style.right.px]="-1"
             [style.bottom.px]="-7"
             [style.z-index]="5">
          <mat-icon>aspect_ratio</mat-icon>
        </div>
        <div class="aspect-inserted-element" [style.width.px]="element.width"
             [style.overflow]="'auto'"
             [style.height.px]="element.height">
          <ng-template #elementContainer></ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [
    '.draggable-element {position: absolute}',
    '.draggable-element:active {cursor: grabbing}',
    '.resizeHandle {position: absolute; cursor: nwse-resize}',
    '.resize-droplist {position: absolute}'
  ]
})
export class StaticCanvasOverlayComponent extends CanvasElementOverlay {
  private oldX: number = 0;
  private oldY: number = 0;

  resizeDragStart(): void {
    this.oldX = this.element.width;
    this.oldY = this.element.height;
  }

  resizeElement(event: CdkDragMove): void {
    this.element.width = Math.max(this.oldX + event.distance.x, 0);
    this.element.height = Math.max(this.oldY + event.distance.y, 0);
  }

  updateModel(event: CdkDragEnd): void {
    this.unitService.updateElementProperty(
      this.selectionService.getSelectedElements(),
      'width',
      Math.max(this.oldX + event.distance.x, 0)
    );
    this.unitService.updateElementProperty(
      this.selectionService.getSelectedElements(),
      'height',
      Math.max(this.oldY + event.distance.y, 0)
    );
  }

  deleteSelectedElements(): void {
    this.selectionService.selectedElements
      .pipe(take(1))
      .subscribe((selectedElements: UIElement[]) => {
        this.unitService.deleteElements(selectedElements);
        this.selectionService.clearElementSelection();
      })
      .unsubscribe();
  }
}
