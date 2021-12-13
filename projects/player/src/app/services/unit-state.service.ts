import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  Progress,
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
  private _unitStateElementCodes!: UnitStateElementCode[];
  private _presentedPageAdded = new Subject<number>();
  private _unitStateElementCodeChanged = new Subject<UnitStateElementCode>();
  private presentedPages: number[] = [];
  private elementPageMap: { [elementId: string]: number } = {};
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

  set unitStateElementCodes(unitStateElementCodes: UnitStateElementCode[]) {
    this._unitStateElementCodes = unitStateElementCodes;
  }

  get unitStateElementCodes(): UnitStateElementCode[] {
    return this._unitStateElementCodes;
  }

  get unitStateElementCodeChanged(): Observable<UnitStateElementCode> {
    return this._unitStateElementCodeChanged.asObservable();
  }

  get presentedPageAdded(): Observable<number> {
    return this._presentedPageAdded.asObservable();
  }

  get presentedPagesProgress(): Progress {
    if (this.elementPageIndices.length && !this.presentedPages.length) {
      return 'none';
    }
    return (
      this.elementPageIndices.length === this.presentedPages.length
    ) ? 'complete' : 'some';
  }

  registerElement(element: { id: string, value: InputElementValue },
                  domElement: Element,
                  pageIndex: number): void {
    this.elementPageMap[element.id] = pageIndex;
    this.addUnitStateElementCode(element.id, element.value);
    this.intersectionDetector.observe(domElement, element.id);
    this.intersectionDetector.intersecting
      .subscribe((id: string) => {
        this.changeElementStatus({ id: id, status: 'DISPLAYED' });
        this.intersectionDetector.unobserve(id);
      });
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

  private get elementPageIndices(): number[] {
    return Object.keys(this.elementPageMap).reduce((elementPageIndices: number[], elementId: string) => {
      if (!elementPageIndices.includes(this.elementPageMap[elementId])) {
        elementPageIndices.push(this.elementPageMap[elementId]);
      }
      return elementPageIndices;
    }, []);
  }

  private setUnitStateElementCodeStatus(id: string, status: UnitStateElementCodeStatus): void {
    const unitStateElementCode = this.getUnitStateElement(id);
    if (unitStateElementCode) {
      // Set status only if it is higher than the old status
      if (UnitStateElementCodeStatusValue[status] >= UnitStateElementCodeStatusValue[unitStateElementCode.status]) {
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
        this.presentedPages.push(pageIndex);
        this._presentedPageAdded.next(pageIndex);
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
    } else {
      this.checkPresentedPageStatus(id);
    }
  }
}
