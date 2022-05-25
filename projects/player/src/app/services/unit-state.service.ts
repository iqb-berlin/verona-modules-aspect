import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  Progress,
  StatusChangeElement,
  ElementCode,
  ElementCodeStatus,
  ElementCodeStatusValue
} from 'player/modules/verona/models/verona';
import { IntersectionDetector } from '../classes/intersection-detector';
import { LogService } from 'player/modules/logging/services/log.service';
import { InputElementValue, ValueChangeElement } from 'common/models/elements/element';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _elementCodes: ElementCode[] = [];
  private _presentedPageAdded = new Subject<number>();
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
    this.elementIdPageIndexMap[elementId] = pageIndex;
    this.addElementCode(elementId, elementValue);
    this.addIntersectionDetection(elementId, domElement);
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
  }

  private addIntersectionDetection(elementId: string, domElement: Element): void {
    this.intersectionDetector.observe(domElement, elementId);
    this.intersectionDetector.intersecting
      .subscribe((id: string) => {
        this.changeElementCodeStatus({ id: id, status: 'DISPLAYED' });
        this.intersectionDetector.unobserve(id);
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
      if (ElementCodeStatusValue[status] >= ElementCodeStatusValue[unitStateElementCode.status]) {
        unitStateElementCode.status = status;
        this._elementCodeChanged.next(unitStateElementCode);
        this.checkPresentedPageStatus(id);
      }
    }
  }

  private checkPresentedPageStatus(id: string): void {
    const pageIndex = this.elementIdPageIndexMap[id];
    if (this.presentedPages.indexOf(pageIndex) === -1) {
      const notDisplayedElements = Object.entries(this.elementIdPageIndexMap)
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
      LogService.warn(`player: page ${pageIndex} is already presented`);
    }
  }

  private addElementCode(id: string, value: InputElementValue): void {
    let unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      // when reloading a unit elementCodes are already pushed
      unitStateElementCode = { id: id, value: value, status: 'NOT_REACHED' };
      this.elementCodes.push(unitStateElementCode);
    }
    this._elementCodeChanged.next(unitStateElementCode);
    // check pages status only if all reloaded elements have their pageIndex
    if (Object.keys(this.elementIdPageIndexMap).length === this.elementCodes.length) {
      this.checkPresentedPageStatus(id);
    }
  }
}
