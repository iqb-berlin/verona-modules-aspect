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
  /**
   * The size every selected element had when the resize drag started, by element id.
   *
   * Needed per element, not just for the dragged one: each element keeps its own size and takes the
   * distance dragged on top (#1156), and reading the current size when the drag ends would count
   * that distance twice for the dragged element - `resizeElement()` has already moved its dimensions
   * as a live preview.
   *
   * The dragged element is added last so it wins over its own entry from the selection: the drag
   * starts by selecting it, but nothing here depends on that having happened yet.
   */
  private startDimensions = new Map<string, { width: number; height: number }>();

  resizeDragStart(): void {
    this.startDimensions = new Map(
      [...this.selectionService.getSelectedElements(), this.element]
        .map(element => [element.id, {
          width: element.dimensions.width,
          height: element.dimensions.height
        }])
    );
  }

  /**
   * The live preview, on the dragged element only - the same as a move, where the CDK transforms the
   * dragged element and the rest of the selection follows on drop.
   */
  resizeElement(event: CdkDragMove): void {
    const start = this.startDimensions.get(this.element.id);
    if (!start) return;
    this.element.dimensions.width = Math.max(start.width + event.distance.x, 0);
    this.element.dimensions.height = Math.max(start.height + event.distance.y, 0);
  }

  /*
   * Every selected element grows by the distance dragged, from its own starting size - what
   * `SectionComponent.elementDropped()` does for a move, and therefore per element rather than one
   * value for the whole selection (#1156). It used to give them all the absolute size of the dragged
   * element: a 400x300 image selected with a 100x50 border became 120x70 on a 20px drag, and the
   * editor has no undo to take that back. That behaviour dates from 2021 but had no effect between
   * the introduction of the dimensions group in 2023 and the fix in #1142, which is why nobody can
   * have grown used to it.
   *
   * width and height go through updateElementsDimensionsProperty because they live in the dimensions
   * group. Calling updateElementsProperty instead ended up in UIElement.setProperty and put a stray
   * width on the element itself, where nothing reads it (#1142).
   */
  updateModel(event: CdkDragEnd): void {
    this.selectionService.getSelectedElements().forEach(element => {
      const start = this.startDimensions.get(element.id);
      if (!start) return;
      this.elementService.updateElementsDimensionsProperty(
        [element], 'width', Math.max(start.width + event.distance.x, 0)
      );
      this.elementService.updateElementsDimensionsProperty(
        [element], 'height', Math.max(start.height + event.distance.y, 0)
      );
    });
  }

  /* deleteElements is not awaited -- it hangs on its confirmation dialog -- and it takes the deleted
     elements out of the selection itself. Unselecting here would happen while the dialog is still
     open, so a user who declines would be left with the elements still there but unselected (#1258). */
  deleteSelectedElements(): void {
    /* The same rule the properties panel has always had for its delete button: with a child of a
       compound element in the selection, deleting is off. Deleting what is left instead would take
       the child's neighbours and leave the child, which is what the key did after #1262 -- and the
       flag only became a reliable answer about the selection with #1268. */
    if (this.selectionService.isCompoundChildSelected) return;
    this.selectionService.selectedElements
      .pipe(take(1))
      .subscribe((selectedElements: UIElement[]) => {
        this.elementService.deleteElements(selectedElements);
      })
      .unsubscribe();
  }
}
