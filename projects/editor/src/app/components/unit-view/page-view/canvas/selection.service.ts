import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { UnitUIElement } from '../../../../../../../common/unit';
import { CanvasElementOverlay } from './canvas-element-overlay';

@Injectable({
  providedIn: 'root'
})
export class SelectionService implements OnDestroy { // TODO selectionService
  private ngUnsubscribe = new Subject<void>();
  selectedComponentElements: CanvasElementOverlay[] = [];

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

  selectElement(event: { componentElement: CanvasElementOverlay; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearSelection();
    }
    this.selectedComponentElements.push(event.componentElement);
    event.componentElement.setSelected(true); // TODO direkt in der component?

    this.elementSelected.next(this.selectedComponentElements.map(componentElement => componentElement.element));
  }

  private clearSelection() {
    this.selectedComponentElements.forEach((overlayComponent: CanvasElementOverlay) => {
      overlayComponent.setSelected(false);
    });
    this.selectedComponentElements = [];
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
