import { Component } from '@angular/core';
import { take } from 'rxjs/operators';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { UIElement } from 'common/models/elements/element';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ElementOverlay } from './element-overlay.directive';

@Component({
    selector: 'aspect-editor-static-overlay',
    imports: [
        NgIf,
        CdkDrag,
        CdkDropList,
        CdkDragPlaceholder,
        MatIconModule
    ],
    template: `
    <!-- Is also a droplist to catch the resize drop and not let it bubble up to the canvas drop handler. -->
    <!-- TabIndex is needed to make the div selectable and catch keyboard events (delete). -->
    <div class="draggable-element"
         [class.temporaryHighlight]="temporaryHighlight"
         (click)="selectElement($event)"
         (dblclick)="openEditDialog()"
         (keyup.delete)="deleteSelectedElements()" tabindex="-1"
         cdkDrag [cdkDragData]="{dragType: 'move', element: element}"
         (cdkDragStarted)="selectElement()"
         cdkDropList>
      <div *cdkDragPlaceholder></div>
      <!-- Needs extra div because styling can interfere with drag and drop-->
      <div [style.position]="'absolute'"
           [style.outline]="isSelected ? '1px dashed purple' : ''"
           [style.left.px]="element.position.xPosition"
           [style.top.px]="element.position.yPosition"
           [style.z-index]="element.position.zIndex">
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
        <div class="aspect-inserted-element"
             [style.width.px]="element.dimensions.width"
             [style.height.px]="element.dimensions.height"
             [style.overflow]="'auto'">
          <ng-template #elementContainer></ng-template>
        </div>
      </div>
    </div>
  `,
    styles: [
        '.draggable-element {position: absolute}',
        '.draggable-element:active {cursor: grabbing}',
        '.resizeHandle {position: absolute; cursor: nwse-resize}',
        '.resize-droplist {position: absolute}',
        '.temporaryHighlight {z-index: 100}'
    ]
})
export class StaticOverlayComponent extends ElementOverlay {
  private oldX: number = 0;
  private oldY: number = 0;

  resizeDragStart(): void {
    this.oldX = this.element.dimensions.width;
    this.oldY = this.element.dimensions.height;
  }

  resizeElement(event: CdkDragMove): void {
    this.element.dimensions.width = Math.max(this.oldX + event.distance.x, 0);
    this.element.dimensions.height = Math.max(this.oldY + event.distance.y, 0);
  }

  updateModel(event: CdkDragEnd): void {
    this.elementService.updateElementsProperty(
      this.selectionService.getSelectedElements(),
      'width',
      Math.max(this.oldX + event.distance.x, 0)
    );
    this.elementService.updateElementsProperty(
      this.selectionService.getSelectedElements(),
      'height',
      Math.max(this.oldY + event.distance.y, 0)
    );
  }

  deleteSelectedElements(): void {
    this.selectionService.selectedElements
      .pipe(take(1))
      .subscribe((selectedElements: UIElement[]) => {
        this.elementService.deleteElements(selectedElements);
        this.selectionService.clearElementSelection();
      })
      .unsubscribe();
  }
}
