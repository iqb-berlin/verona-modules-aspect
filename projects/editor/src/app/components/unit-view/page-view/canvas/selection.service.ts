import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { CanvasDragOverlayComponent } from './canvas-drag-overlay.component';
import { UnitUIElement } from '../../../../../../../common/unit';

@Injectable({
  providedIn: 'root'
})
export class SelectionService implements OnDestroy { // TODO selectionService
  private ngUnsubscribe = new Subject<void>();
  selectedComponentElements: CanvasDragOverlayComponent[] = [];

  elementSelected: Subject<UnitUIElement[]> = new Subject<UnitUIElement[]>();

  constructor(private unitService: UnitService) {
    this.unitService.selectedPageIndex
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.clearSelection();
      });
  }

  getSelectedElements(): UnitUIElement[] {
    return this.selectedComponentElements.map(element => element.element);
  }

  selectElement(event: { componentElement: CanvasDragOverlayComponent; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearSelection();
    }
    this.selectedComponentElements.push(event.componentElement);
    event.componentElement.setSelected(true); // TODO direkt in der component?

    this.elementSelected.next(this.selectedComponentElements.map(componentElement => componentElement.element));
  }

  private clearSelection() {
    this.selectedComponentElements.forEach((overlayComponent: CanvasDragOverlayComponent) => {
      overlayComponent.setSelected(false);
    });
    this.selectedComponentElements = [];
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
