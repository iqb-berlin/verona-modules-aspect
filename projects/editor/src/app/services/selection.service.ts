import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UIElement } from '../../../../common/models/uI-element';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  selectedPageIndex: number = 0;
  selectedPageSectionIndex: number = 0;
  private _selectedElements!: BehaviorSubject<UIElement[]>;
  selectedElementComponents: any[] = [];
  selectedCompoundChild: { element: UIElement, nativeElement: HTMLElement } | null = null;

  constructor() {
    this._selectedElements = new BehaviorSubject([] as UIElement[]);
  }

  get selectedElements(): Observable<UIElement[]> {
    return this._selectedElements.asObservable();
  }

  getSelectedElements(): UIElement[] {
    return this._selectedElements.value;
  }

  selectElement(event: { componentElement: any; multiSelect: boolean }): void { // TODO UIElement statt any
    if (!event.multiSelect) {
      this.clearElementSelection();
    }
    this.removeCompoundChildSelection();
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

  selectCompoundChild(element: UIElement, nativeElement: HTMLElement): void {
    this.removeCompoundChildSelection();

    this.setCompoundChildSelection(element, nativeElement);
    this.selectedCompoundChild = { element: element, nativeElement: nativeElement };
    this._selectedElements.next([element]);
  }

  private setCompoundChildSelection(element: UIElement, nativeElement: HTMLElement): void {
    if (element.type === 'text-field') {
      (nativeElement.children[0] as HTMLElement).style.border = '1px solid';
    } else {
      nativeElement.style.border = '1px solid';
    }
  }

  private removeCompoundChildSelection(): void {
    if (this.selectedCompoundChild) {
      if (this.selectedCompoundChild.element.type === 'text-field') {
        (this.selectedCompoundChild.nativeElement.children[0] as HTMLElement).style.border = 'unset';
      } else {
        this.selectedCompoundChild.nativeElement.style.border = 'unset';
      }
      this.selectedCompoundChild = null;
    }
  }
}
