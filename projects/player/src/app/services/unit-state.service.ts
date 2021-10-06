import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UnitUIElement } from '../../../../common/unit';
import { UnitStateElementCode, UnitStateElementCodeStatus } from '../models/verona';
import { ValueChangeElement } from '../../../../common/form';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _presentedPageAdded = new Subject<number>();
  unitStateElementCodes!: UnitStateElementCode[];

  getUnitStateElement(id: string): UnitStateElementCode | undefined {
    return this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === id);
  }

  setUnitStateElementCodeValue(id: string, value: string | number | boolean | undefined): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
    }
  }

  setUnitStateElementCodeStatus(id: string, status: UnitStateElementCodeStatus): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      unitStateElementCode.status = status;
    }
  }

  get presentedPageAdded(): Observable<number> {
    return this._presentedPageAdded.asObservable();
  }

  registerElement(element: UnitUIElement): void {
    this.addUnitStateElementCode(element.id, element.value);
  }

  addPresentedPage(presentedPage: number): void {
    this._presentedPageAdded.next(presentedPage);
  }

  changeElementValue(elementValues: ValueChangeElement): void {
    // eslint-disable-next-line no-console
    console.log(`player: onElementValueChanges ${elementValues.id}:
     old: ${elementValues.values[0]}, new: ${elementValues.values[1]}`);
    this.setUnitStateElementCodeStatus(elementValues.id, 'VALUE_CHANGED');
    this.setUnitStateElementCodeValue(elementValues.id, elementValues.values[1]);
  }

  private addUnitStateElementCode(id: string, value: string | number | boolean | string[] | undefined): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (!unitStateElementCode) {
      this.unitStateElementCodes.push({ id: id, value: value, status: 'NOT_REACHED' });
    }
  }
}
