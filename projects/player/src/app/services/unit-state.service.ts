import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  Progress,
  StatusChangeElement,
  ElementCode,
  ElementCodeStatus,
  ElementCodeStatusValue
} from 'verona/models/verona';
import { IntersectionDetector } from '../classes/intersection-detector';
import { InputElementValue, ValueChangeElement } from 'common/interfaces/elements';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _elementCodes!: ElementCode[];
  private _presentedPageAdded = new Subject<number>();
  private _elementCodeChanged = new Subject<ElementCode>();
  private presentedPages: number[] = [];
  private elementPageMap: { [elementId: string]: number } = {};
  private intersectionDetector!: IntersectionDetector;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.intersectionDetector = new IntersectionDetector(document, '0px 0px 0px 0px');
  }

  getElementCodeById(id: string): ElementCode | undefined {
    return this.elementCodes
      .find((elementCode: ElementCode): boolean => elementCode.id === id);
  }

  isRegistered(id: string): boolean {
    return !!(this.getElementCodeById(id));
  }

  set elementCodes(unitStateElementCodes: ElementCode[]) {
    this._elementCodes = unitStateElementCodes;
  }

  get elementCodes(): ElementCode[] {
    return this._elementCodes;
  }

  get elementCodeChanged(): Observable<ElementCode> {
    return this._elementCodeChanged.asObservable();
  }

  get presentedPageAdded(): Observable<number> {
    return this._presentedPageAdded.asObservable();
  }

  get presentedPagesProgress(): Progress {
    if (this.elementPageIndices.length && !this.presentedPages.length) {
      return 'none';
    }
    return (this.elementPageIndices.length === this.presentedPages.length) ? 'complete' : 'some';
  }

  registerElement(elementId: string,
                  elementValue: InputElementValue,
                  domElement: Element,
                  pageIndex: number): void {
    this.elementPageMap[elementId] = pageIndex;
    this.addElementCode(elementId, elementValue);
    this.intersectionDetector.observe(domElement, elementId);
    this.intersectionDetector.intersecting
      .subscribe((id: string) => {
        this.changeElementCodeStatus({ id: id, status: 'DISPLAYED' });
        this.intersectionDetector.unobserve(id);
      });
  }

  changeElementCodeValue(elementValue: ValueChangeElement): void {
    // eslint-disable-next-line no-console
    console.log(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
    this.setElementCodeValue(elementValue.id, elementValue.value);
  }

  changeElementCodeStatus(elementStatus: StatusChangeElement): void {
    // eslint-disable-next-line no-console
    console.log(`player: changeElementStatus ${elementStatus.id}: ${elementStatus.status}`);
    this.setElementCodeStatus(elementStatus.id, elementStatus.status);
  }

  reset(): void {
    this.elementPageMap = {};
    this.elementCodes = [];
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

  private setElementCodeValue(id: string, value: InputElementValue): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
      this._elementCodeChanged.next(unitStateElementCode);
    }
  }

  private setElementCodeStatus(id: string, status: ElementCodeStatus): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      // Set status only if it is higher than the old status
      if (ElementCodeStatusValue[status] >= ElementCodeStatusValue[unitStateElementCode.status]) {
        unitStateElementCode.status = status;
        this._elementCodeChanged.next(unitStateElementCode);
        this.checkPresentedPageStatus(id);
      }
    }
  }

  private checkPresentedPageStatus(id: string): void {
    const pageIndex = this.elementPageMap[id];
    if (this.presentedPages.indexOf(pageIndex) === -1) {
      const notDisplayedElements = Object.entries(this.elementPageMap)
        .filter((map: [string, number]): boolean => map[1] === pageIndex)
        .map((pageElement: [string, number]): ElementCode | undefined => this
          .getElementCodeById(pageElement[0]))
        .filter(pageElement => pageElement && ElementCodeStatusValue[pageElement.status] <
          ElementCodeStatusValue.DISPLAYED);
      if (notDisplayedElements.length === 0) {
        this.presentedPages.push(pageIndex);
        this._presentedPageAdded.next(pageIndex);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(`player: page ${pageIndex} is already presented`);
    }
  }

  private addElementCode(id: string, value: InputElementValue): void {
    if (!this.getElementCodeById(id)) {
      const unitStateElementCode: ElementCode = { id: id, value: value, status: 'NOT_REACHED' };
      this.elementCodes.push(unitStateElementCode);
      this._elementCodeChanged.next(unitStateElementCode);
    } else {
      this.checkPresentedPageStatus(id);
    }
  }
}
