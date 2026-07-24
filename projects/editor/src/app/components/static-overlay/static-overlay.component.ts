import { Component } from '@angular/core';
import { take } from 'rxjs/operators';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { UIElement } from 'common/models/elements/element';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';

@Component({
  selector: 'aspect-editor-static-overlay',
  standalone: false,
  templateUrl: './static-overlay.component.html',
  styleUrls: ['./static-overlay.component.scss']
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
