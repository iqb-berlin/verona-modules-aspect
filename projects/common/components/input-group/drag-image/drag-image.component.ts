import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { BasicStyles } from 'common/models/elements/property-group-interfaces';
import { DragNDropValueObject } from 'common/interfaces';

@Component({
  selector: 'aspect-drag-image',
  templateUrl: './drag-image.component.html',
  styleUrls: ['./drag-image.component.scss'],
  standalone: false
})
export class DragImageComponent {
  @Input() clozeContext: boolean = false;
  @Input() styling!: BasicStyles;

  draggedItem: DragNDropValueObject | undefined;
  dragImageX: number | undefined;
  dragImageY: number | undefined;
  dragImageOffsetX: number = 0;
  dragImageOffsetY: number = 0;
  dragImageWidth: number = 0;
  dragImageHeight: number = 0;

  constructor(public cdr: ChangeDetectorRef) { }

  /* - dragImageOffset is used so that the item is held where it is grabbed (relatively) and not the top left corner.
     - e.touches[0].clientX, e.touches[0].clientY: absolute coordinates of the touch/click
     - elementRect.left and top: absolute margin of dragged item to viewport */
  initDragPreview(item: DragNDropValueObject, sourceElement: Element, x: number, y: number): void {
    this.draggedItem = item;
    const elementRect = sourceElement.getBoundingClientRect();
    this.dragImageWidth = elementRect.width;
    this.dragImageHeight = elementRect.height;
    this.dragImageOffsetX = x - elementRect.left; // margin between element edge und touch/click
    this.dragImageOffsetY = y - elementRect.top;

    this.setDragPreviewPosition(x, y);
  }

  setDragPreviewPosition(x: number, y: number): void {
    this.dragImageX = x - this.dragImageOffsetX;
    this.dragImageY = y - this.dragImageOffsetY;
    this.cdr.detectChanges();
  }

  unsetDragPreview(): void {
    this.draggedItem = undefined;
    this.dragImageX = undefined;
    this.dragImageY = undefined;
    this.cdr.detectChanges();
  }
}
