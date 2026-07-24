import {
  Component, Input
} from '@angular/core';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';

@Component({
  selector: 'aspect-editor-dynamic-overlay',
  imports: [
    CdkDrag,
    CdkDragPlaceholder
  ],
  templateUrl: './dynamic-overlay.component.html',
  styleUrls: ['./dynamic-overlay.component.scss']
})
export class DynamicOverlayComponent extends ElementOverlay {
  @Input() dynamicPositioning!: boolean;
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
    this.bodyElement.style.cursor = 'grabbing';
  }

  unsetCursorFix(): void {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }
}
