import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  Progress, StatusChangeElement, ElementCode, ElementCodeStatus, ElementCodeStatusValue
} from 'player/modules/verona/models/verona';
import { LogService } from 'player/modules/logging/services/log.service';
import { InputElementValue, ValueChangeElement } from 'common/models/elements/element';
import { IntersectionDetector } from '../classes/intersection-detector';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _elementCodes: ElementCode[] = [];
  private _pagePresented = new Subject<number>();
  private _elementCodeChanged = new Subject<ElementCode>();
  private presentedPages: number[] = [];
  private elementIdPageIndexMap: { [elementId: string]: number } = {};
  private intersectionDetector: IntersectionDetector;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.intersectionDetector = new IntersectionDetector(document, '0px 0px 0px 0px');
  }

  getElementCodeById(id: string): ElementCode | undefined {
    return this.elementCodes
      .find((elementCode: ElementCode): boolean => elementCode.id === id);
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

  get pagePresented(): Observable<number> {
    return this._pagePresented.asObservable();
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
    this.elementIdPageIndexMap[elementId] = pageIndex;
    this.addElementCode(elementId, elementValue, domElement);
  }

  changeElementCodeValue(elementValue: ValueChangeElement): void {
    LogService.info(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeValue(elementValue.id, elementValue.value);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
  }

  changeElementCodeStatus(elementStatus: StatusChangeElement): void {
    LogService.info(`player: changeElementStatus ${elementStatus.id}: ${elementStatus.status}`);
    this.setElementCodeStatus(elementStatus.id, elementStatus.status);
  }

  reset(): void {
    this.elementCodes = [];
    this.presentedPages = [];
    this.elementIdPageIndexMap = {};
    this.intersectionDetector = new IntersectionDetector(this.document, '0px 0px 0px 0px');
  }

  private addIntersectionDetection(elementId: string, domElement: Element): void {
    this.intersectionDetector.observe(domElement, elementId);
    this.intersectionDetector.intersecting
      .subscribe((id: string) => {
        if (elementId === id) {
          this.changeElementCodeStatus({ id: id, status: 'DISPLAYED' });
          this.intersectionDetector.unobserve(id);
        }
      });
  }

  private get elementPageIndices(): number[] {
    return Object.keys(this.elementIdPageIndexMap).reduce((elementPageIndices: number[], elementId: string) => {
      if (!elementPageIndices.includes(this.elementIdPageIndexMap[elementId])) {
        elementPageIndices.push(this.elementIdPageIndexMap[elementId]);
      }
      return elementPageIndices;
    }, []);
  }

  private setElementCodeValue(id: string, value: InputElementValue): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
    }
  }

  private setElementCodeStatus(id: string, status: ElementCodeStatus): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      const actualStatus = unitStateElementCode.status;
      unitStateElementCode.status = status;
      this._elementCodeChanged.next(unitStateElementCode);
      if (ElementCodeStatusValue[status] > ElementCodeStatusValue[actualStatus]) {
        this.checkPresentedPageStatus(this.elementIdPageIndexMap[id]);
      }
    }
  }

  private buildPresentedPages(): void {
    const uniqPages = [...new Set(Object.values(this.elementIdPageIndexMap))];
    uniqPages.forEach(pageIndex => this
      .checkPresentedPageStatus(pageIndex));
  }

  private checkPresentedPageStatus(pageIndex: number): void {
    if (this.presentedPages.indexOf(pageIndex) === -1) {
      const notDisplayedElements = Object.entries(this.elementIdPageIndexMap)
        .filter((map: [string, number]): boolean => map[1] === pageIndex)
        .map((pageElement: [string, number]): ElementCode | undefined => this
          .getElementCodeById(pageElement[0]))
        .filter(pageElement => pageElement && ElementCodeStatusValue[pageElement.status] <
          ElementCodeStatusValue.DISPLAYED);
      if (notDisplayedElements.length === 0) {
        this.presentedPages.push(pageIndex);
        this._pagePresented.next(pageIndex);
      }
    } else {
      LogService.info(`player: page ${pageIndex} is already presented`);
    }
  }

  private addElementCode(id: string, value: InputElementValue, domElement: Element): void {
    let unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      // when reloading a unit, elementCodes are already pushed
      unitStateElementCode = { id: id, value: value, status: 'NOT_REACHED' };
      this.elementCodes.push(unitStateElementCode);
      this._elementCodeChanged.next(unitStateElementCode);
    } else if (Object.keys(this.elementIdPageIndexMap).length === this.elementCodes.length) {
      // if all elements are registered, we can rebuild the presentedPages array
      this.buildPresentedPages();
    }
    if (unitStateElementCode.status === 'NOT_REACHED') {
      this.addIntersectionDetection(id, domElement);
    }
  }
}
