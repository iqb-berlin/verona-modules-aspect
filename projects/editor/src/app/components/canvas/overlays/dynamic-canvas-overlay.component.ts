import {
  Component, Input, ViewChild, ElementRef
} from '@angular/core';
import { CanvasElementOverlay } from './canvas-element-overlay';

@Component({
  selector: 'aspect-dynamic-canvas-overlay',
  template: `
      <!-- TabIndex is needed to make the div selectable and catch keyboard events (delete). -->
      <!-- DragStart and DragEnd are part of a cursor hack to style the body. See global styling file. -->
      <div #draggableElement class="draggable-element"
           [class.fixed-size-content-wrapper]="element.position?.dynamicPositioning &&
                                               element.position?.fixedSize"
           [class.temporaryHighlight]="temporaryHighlight"
           tabindex="-1"
           cdkDrag [cdkDragData]="{dragType: 'move', element: element}"
           (click)="elementClicked($event)" (dblclick)="openEditDialog()"
           (cdkDragStarted)="moveDragStart()"
           (cdkDragEnded)="moveDragEnd()"
           [style.outline]="isSelected ? 'purple solid 1px' : ''"
           [style.z-index]="isSelected ? 2 : 1">
          <div *cdkDragPlaceholder></div>
          <div [class.fixed-size-content]="element.position?.dynamicPositioning &&
            element.position?.fixedSize"
               [style.width]="element.position?.dynamicPositioning && element.position?.fixedSize ?
                      element.width + 'px' : '100%'"
               [style.height]="element.position?.dynamicPositioning && element.position?.fixedSize ?
                      element.height + 'px' : '100%'">
              <ng-template #elementContainer></ng-template>
          </div>
      </div>
  `,
  styles: [
    '.draggable-element {width: 100%; height: 100%}',
    '.draggable-element:active {cursor: grabbing}',
    '.temporaryHighlight {z-index: 100}'
  ]
})
export class DynamicCanvasOverlayComponent extends CanvasElementOverlay {
  @Input() dynamicPositioning!: boolean;
  @ViewChild('draggableElement') dragElement!: ElementRef;
  bodyElement: HTMLElement = document.body;

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
