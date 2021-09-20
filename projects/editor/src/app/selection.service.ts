import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Unit, UnitPageSection, UnitUIElement
} from '../../../common/unit';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private unit!: Unit;

  private _selectedPageSection!: BehaviorSubject<UnitPageSection>;
  private selectedPageSectionComponent!: any;
  private selectedSection!: UnitPageSection;

  private _selectedElements!: BehaviorSubject<UnitUIElement[]>;

  selectedElementComponents: any[] = [];

  constructor(unitService: UnitService) {
    unitService.unit.subscribe((unit: Unit) => {
      this.unit = unit;
    });
    this._selectedPageSection = new BehaviorSubject(this.unit.pages[0].sections[0]);
    this._selectedElements = new BehaviorSubject([] as UnitUIElement[]);
  }

  // === SECTION =====
  selectSection(sectionComponent: any): void {
    if (this.selectedPageSectionComponent) {
      this.selectedPageSectionComponent.selected = false;
    }
    this.selectedPageSectionComponent = sectionComponent;
    this.selectedPageSectionComponent.selected = true;
    this.selectedSection = sectionComponent.section;
    this._selectedPageSection.next(sectionComponent.section);
  }

  get selectedPageSection(): Observable<UnitPageSection> {
    return this._selectedPageSection.asObservable();
  }

  setSelectedPageSection(section: UnitPageSection): void {
    this._selectedPageSection.next(section);
  }
  // ### SECTION ######

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
