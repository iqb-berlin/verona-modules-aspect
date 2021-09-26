import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UnitUIElement } from '../../../common/unit';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  selectedPageIndex: number = 0;
  selectedPageSectionIndex: number = 0;
  private _selectedElements!: BehaviorSubject<UnitUIElement[]>;
  selectedElementComponents: any[] = [];

  constructor() {
    this._selectedElements = new BehaviorSubject([] as UnitUIElement[]);
  }

  get selectedElements(): Observable<UnitUIElement[]> {
    return this._selectedElements.asObservable();
  }

  getSelectedElements(): UnitUIElement[] {
    return this._selectedElements.value;
  }

  selectElement(event: { componentElement: any; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearElementSelection();
    }
    this.selectedElementComponents.push(event.componentElement);
    event.componentElement.setSelected(true);
    this._selectedElements.next(this.selectedElementComponents.map(componentElement => componentElement.element));
  }

  clearElementSelection(): void {
    this.selectedElementComponents.forEach((overlayComponent: any) => {
      overlayComponent.setSelected(false);
    });
    this.selectedElementComponents = [];
    this._selectedElements.next([]);
  }
}
