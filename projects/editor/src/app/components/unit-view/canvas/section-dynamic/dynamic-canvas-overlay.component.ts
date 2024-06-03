import {
  Component, Input, ViewChild, ElementRef
} from '@angular/core';
import { CanvasElementOverlay } from '../canvas-element-overlay';

@Component({
  selector: 'aspect-dynamic-canvas-overlay',
  template: `
    <!-- TabIndex is needed to make the div selectable and catch keyboard events (delete). -->
    <!-- DragStart and DragEnd are part of a cursor hack to style the body. See global styling file. -->
    <div #draggableElement class="draggable-element"
         [class.centered-horizontal]="element.dimensions.isWidthFixed"
         [class.centered-vertical]="element.dimensions.isHeightFixed"
         [class.temporaryHighlight]="temporaryHighlight"
         tabindex="-1"
         (click)="selectElement($event)" (dblclick)="openEditDialog()"
         cdkDrag [cdkDragData]="{dragType: 'move', element: element}"
         (cdkDragStarted)="startDrag()"
         (cdkDragEnded)="endDrag()"
         [style.outline]="isSelected ? 'purple solid 1px' : ''"
         [style.z-index]="isSelected ? 2 : 1">
      <div *cdkDragPlaceholder></div>
      <div [class.prevent-interaction]="preventInteraction"
           [style.width]="element.dimensions.isWidthFixed ? element.dimensions.width + 'px' : '100%'"
           [style.height]="element.dimensions.isHeightFixed ? element.dimensions.height + 'px' : '100%'"
           [style.min-width]="element.dimensions.minWidth ? element.dimensions.minWidth + 'px' : null"
           [style.max-width]="element.dimensions.maxWidth ? element.dimensions.maxWidth + 'px' : null"
           [style.min-height]="element.dimensions.minHeight ? element.dimensions.minHeight + 'px' : null"
           [style.max-height]="element.dimensions.maxHeight ? element.dimensions.maxHeight + 'px' : null">
        <ng-template #elementContainer></ng-template>
      </div>
    </div>
  `,
  styles: [
    '.draggable-element {width: 100%; height: 100%}',
    '.draggable-element:active {cursor: grabbing}',
    '.temporaryHighlight {z-index: 100}',
    '.centered-horizontal {display: flex; justify-content: center;}',
    '.centered-vertical {display: flex; align-items: center;}',
    ':host ::ng-deep .prevent-interaction * {pointer-events: none !important;}'
  ]
})
export class DynamicCanvasOverlayComponent extends CanvasElementOverlay {
  @Input() dynamicPositioning!: boolean;
  @ViewChild('draggableElement') dragElement!: ElementRef;
  bodyElement: HTMLElement = document.body;

  startDrag(): void {
    this.selectElement();
    this.setCursorFix();
    this.dragNDropService.isDragInProgress = true;
  }

  endDrag(): void {
    this.unsetCursorFix();
    this.dragNDropService.isDragInProgress = false;
  }

  setCursorFix(): void {
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'move';
  }

  unsetCursorFix(): void {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }
}
