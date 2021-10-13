import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UnitUIElement } from '../../../../common/unit';
import {
  StatusChangeElement,
  UnitStateElementCode,
  UnitStateElementCodeStatus,
  UnitStateElementCodeStatusValue
} from '../models/verona';
import { ValueChangeElement } from '../../../../common/form';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _presentedPageAdded = new Subject<number>();
  private _unitStateElementCodeChanged = new Subject<UnitStateElementCode>();
  unitStateElementCodes!: UnitStateElementCode[];

  getUnitStateElement(id: string): UnitStateElementCode | undefined {
    return this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === id);
  }

  private setUnitStateElementCodeValue(id: string, value: string | number | boolean | undefined): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
      this._unitStateElementCodeChanged.next(unitStateElementCode);
    }
  }

  private setUnitStateElementCodeStatus(id: string, status: UnitStateElementCodeStatus): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      // Set status only if it is higher than the old status
      if (UnitStateElementCodeStatusValue[status] > UnitStateElementCodeStatusValue[unitStateElementCode.status]) {
        unitStateElementCode.status = status;
        this._unitStateElementCodeChanged.next(unitStateElementCode);
      }
    }
  }

  get unitStateElementCodeChanged(): Observable<UnitStateElementCode> {
    return this._unitStateElementCodeChanged.asObservable();
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
    console.log(`player: changeElementValue ${elementValues.id}:
     old: ${elementValues.values[0]}, new: ${elementValues.values[1]}`);
    this.setUnitStateElementCodeStatus(elementValues.id, 'VALUE_CHANGED');
    this.setUnitStateElementCodeValue(elementValues.id, elementValues.values[1]);
  }

  changeElementStatus(elementStatus: StatusChangeElement): void {
    // eslint-disable-next-line no-console
    console.log(`player: changeElementStatus ${elementStatus.id}: ${elementStatus.status}`);
    this.setUnitStateElementCodeStatus(elementStatus.id, elementStatus.status);
  }

  private addUnitStateElementCode(id: string, value: string | number | boolean | string[] | undefined): void {
    if (!this.getUnitStateElement(id)) {
      const unitStateElementCode: UnitStateElementCode = { id: id, value: value, status: 'NOT_REACHED' };
      this.unitStateElementCodes.push(unitStateElementCode);
      this._unitStateElementCodeChanged.next(unitStateElementCode);
    }
  }
}
