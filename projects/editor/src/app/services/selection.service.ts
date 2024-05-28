import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { CanvasElementOverlay } from 'editor/src/app/components/canvas/overlays/canvas-element-overlay';
import {
  ClozeChildOverlay
} from 'common/components/compound-elements/cloze/cloze-child-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  selectedPageIndex: number = 0;
  selectedSectionIndex: number = 0;
  private _selectedElements!: BehaviorSubject<UIElement[]>;
  selectedElementComponents: (CanvasElementOverlay | ClozeChildOverlay)[] = [];
  isClozeChildSelected: boolean = false;

  constructor() {
    this._selectedElements = new BehaviorSubject([] as UIElement[]);
  }

  get selectedElements(): Observable<UIElement[]> {
    return this._selectedElements.asObservable();
  }

  getSelectedElements(): UIElement[] {
    return this._selectedElements.value;
  }

  selectElement(event: { elementComponent: CanvasElementOverlay | ClozeChildOverlay; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearElementSelection();
    }
    this.isClozeChildSelected = false;
    this.selectedElementComponents.push(event.elementComponent);
    event.elementComponent.setSelected(true);
    this._selectedElements.next(this.selectedElementComponents.map(componentElement => componentElement.element));
  }

  clearElementSelection(): void {
    this.selectedElementComponents.forEach((overlayComponent: CanvasElementOverlay | ClozeChildOverlay) => {
      overlayComponent.setSelected(false);
    });
    this.selectedElementComponents = [];
    this._selectedElements.next([]);
  }

  selectPage(index: number) {
    this.clearElementSelection();
    this.selectedPageIndex = index;
    this.selectedSectionIndex = 0;
  }

  selectPreviousPage() {
    this.selectPage(Math.max(this.selectedPageIndex - 1, 0));
  }
}
