import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  StatusChangeElement,
  UnitStateElementCode,
  UnitStateElementCodeStatus,
  UnitStateElementCodeStatusValue
} from '../models/verona';
import { InputElementValue, ValueChangeElement } from '../../../../common/models/uI-element';
import { IntersectionDetector } from '../classes/intersection-detector';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  unitStateElementCodes!: UnitStateElementCode[];
  presentedPages: number[] = [];
  private elementPageMap: { [elementId: string]: number } = {};
  private _presentedPageAdded = new Subject<number>();
  private _unitStateElementCodeChanged = new Subject<UnitStateElementCode>();
  private intersectionDetector!: IntersectionDetector;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.intersectionDetector = new IntersectionDetector(document, '0px 0px 0px 0px');
  }

  getUnitStateElement(id: string): UnitStateElementCode | undefined {
    return this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === id);
  }

  setUnitStateElementCodeValue(id: string, value: InputElementValue): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
      this._unitStateElementCodeChanged.next(unitStateElementCode);
    }
  }

  get unitStateElementCodeChanged(): Observable<UnitStateElementCode> {
    return this._unitStateElementCodeChanged.asObservable();
  }

  get presentedPageAdded(): Observable<number> {
    return this._presentedPageAdded.asObservable();
  }

  registerElement(element: { id: string, value: InputElementValue },
                  domElement: Element,
                  pageIndex: number): void {
    this.addUnitStateElementCode(element.id, element.value);
    this.elementPageMap[element.id] = pageIndex;
    this.intersectionDetector.observe(domElement, element.id);
    this.intersectionDetector.intersecting
      .subscribe((id: string) => {
        this.changeElementStatus({ id: id, status: 'DISPLAYED' });
        this.intersectionDetector.unobserve(id);
      });
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

  reset(): void {
    this.elementPageMap = {};
    this.unitStateElementCodes = [];
    this.presentedPages = [];
  }

  private setUnitStateElementCodeStatus(id: string, status: UnitStateElementCodeStatus): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      // Set status only if it is higher than the old status
      if (UnitStateElementCodeStatusValue[status] > UnitStateElementCodeStatusValue[unitStateElementCode.status]) {
        unitStateElementCode.status = status;
        this._unitStateElementCodeChanged.next(unitStateElementCode);
        this.checkPresentedPageStatus(id);
      }
    }
  }

  private checkPresentedPageStatus(id: string): void {
    const pageIndex = this.elementPageMap[id];
    if (this.presentedPages.indexOf(pageIndex) === -1) {
      const notDisplayedElements = Object.entries(this.elementPageMap)
        .filter((map: [string, number]): boolean => map[1] === pageIndex)
        .map((pageElement: [string, number]): UnitStateElementCode | undefined => this
          .getUnitStateElement(pageElement[0]))
        .filter(pageElement => pageElement && UnitStateElementCodeStatusValue[pageElement.status] <
          UnitStateElementCodeStatusValue.DISPLAYED);
      if (notDisplayedElements.length === 0) {
        this.addPresentedPage(pageIndex);
        this.presentedPages.push(pageIndex);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(`player: page ${pageIndex} is already presented`);
    }
  }

  private addUnitStateElementCode(id: string, value: InputElementValue): void {
    if (!this.getUnitStateElement(id)) {
      const unitStateElementCode: UnitStateElementCode = { id: id, value: value, status: 'NOT_REACHED' };
      this.unitStateElementCodes.push(unitStateElementCode);
      this._unitStateElementCodeChanged.next(unitStateElementCode);
    }
  }
}
