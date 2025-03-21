import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { ElementOverlay } from 'editor/src/app/components/unit-view/element-overlay/element-overlay.directive';
import {
  ClozeChildOverlay
} from 'common/components/compound-elements/cloze/cloze-child-overlay.component';
import { TableChildOverlay } from 'common/components/compound-elements/table/table-child-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  selectedPageIndex: number = 0;
  selectedSectionIndex: number = 0;
  private _selectedElements!: BehaviorSubject<UIElement[]>;
  selectedElementComponents: (ElementOverlay | ClozeChildOverlay | TableChildOverlay)[] = [];
  isCompoundChildSelected: boolean = false;

  constructor() {
    this._selectedElements = new BehaviorSubject([] as UIElement[]);
  }

  reset(): void {
    this.selectedPageIndex = 0;
    this.selectedSectionIndex = 0;
    this.selectedElementComponents = [];
  }

  updateSelection(pageIndex: number, sectionIndex: number): void {
    this.selectedPageIndex = pageIndex;
    this.selectedSectionIndex = sectionIndex;
  }

  get selectedElements(): Observable<UIElement[]> {
    return this._selectedElements.asObservable();
  }

  getSelectedElements(): UIElement[] {
    return this._selectedElements.value;
  }

  selectElement(event: { elementComponent: ElementOverlay | ClozeChildOverlay | TableChildOverlay; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearElementSelection();
    }
    this.isCompoundChildSelected = false;
    this.selectedElementComponents.push(event.elementComponent);
    event.elementComponent.setSelected(true);
    this._selectedElements.next(this.selectedElementComponents.map(componentElement => componentElement.element));
  }

  clearElementSelection(): void {
    this.selectedElementComponents
      .forEach((overlayComponent: ElementOverlay | ClozeChildOverlay | TableChildOverlay) => {
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
