import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  Progress, StatusChangeElement, Response, ResponseStatusType, ElementCodeStatusValue, ResponseValueType
} from 'player/modules/verona/models/verona';
import { LogService } from 'player/modules/logging/services/log.service';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { IntersectionDetector } from '../classes/intersection-detector';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService extends ElementCodeService {
  private _pagePresented = new Subject<number>();
  private presentedPages: number[] = [];
  private elementIdPageIndexMap: { [elementId: string]: number } = {};
  private ignoredPageIndexElementIds: string[] = [];
  private intersectionDetector: IntersectionDetector;

  constructor(@Inject(DOCUMENT) private document: Document) {
    super();
    this.intersectionDetector = new IntersectionDetector(document, '0px 0px 0px 0px');
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

  registerElementCode(elementId: string,
                      elementValue: ResponseValueType,
                      domElement: Element | null = null,
                      pageIndex: number | null = null): void {
    if (pageIndex !== null) {
      this.elementIdPageIndexMap[elementId] = pageIndex;
    } else {
      this.ignoredPageIndexElementIds.push(elementId);
    }
    this.addElementCode(elementId, elementValue, domElement);
  }

  changeElementCodeStatus(elementStatus: StatusChangeElement): void {
    LogService.debug(`player: changeElementStatus ${elementStatus.id}: ${elementStatus.status}`);
    this.setElementCodeStatus(elementStatus.id, elementStatus.status);
  }

  reset(): void {
    super.reset();
    this.presentedPages = [];
    this.elementIdPageIndexMap = {};
    this.ignoredPageIndexElementIds = [];
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

  override setElementCodeStatus(id: string, status: ResponseStatusType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      const actualStatus = unitStateElementCode.status;
      unitStateElementCode.status = status;
      this._elementCodeChanged.next(unitStateElementCode);
      if (ElementCodeStatusValue[status] > ElementCodeStatusValue[actualStatus]) {
        if (this.elementIdPageIndexMap[id] !== undefined) {
          this.checkPresentedPageStatus(this.elementIdPageIndexMap[id]);
        }
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
        .map((pageElement: [string, number]): Response | undefined => this
          .getElementCodeById(pageElement[0]))
        .filter(pageElement => pageElement && ElementCodeStatusValue[pageElement.status] <
          ElementCodeStatusValue.DISPLAYED);
      if (notDisplayedElements.length === 0) {
        this.presentedPages.push(pageIndex);
        this._pagePresented.next(pageIndex);
      }
    } else {
      LogService.debug(`player: page ${pageIndex} is already presented`);
    }
  }

  private addElementCode(id: string, value: ResponseValueType, domElement: Element | null): void {
    let unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      // when reloading a unit, elementCodes are already pushed
      const status = domElement ? 'NOT_REACHED' : 'UNSET';
      unitStateElementCode = { id, value, status };
      this.addInitialElementCode(unitStateElementCode);
    } else if (Object.keys(this.elementIdPageIndexMap)
      .length === this.elementCodes.length - this.ignoredPageIndexElementIds.length) {
      // if all elements are registered, we can rebuild the presentedPages array
      this.buildPresentedPages();
    }
    if (domElement && unitStateElementCode.status === 'NOT_REACHED') {
      this.addIntersectionDetection(id, domElement);
    }
  }
}
