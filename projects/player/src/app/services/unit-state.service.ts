import {
  Inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  DOCUMENT
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Progress, StatusChangeElement, ElementCodeStatusValue } from 'player/modules/verona/models/verona';
import { LogService } from 'player/modules/logging/services/log.service';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { Response, ResponseStatusType, ResponseValueType } from '@iqb/responses';
import { IntersectionDetector } from '../classes/intersection-detector';

/**
 * The answers of the elements, plus what the host is told about presentation: which pages have been
 * seen in full.
 *
 * A page counts as presented once every element on it has been displayed, and an element counts as
 * displayed once it has been scrolled into view -- which is what the intersection detector here
 * watches. Elements that are registered without a page index, the ones inside another element, do not
 * count towards a page.
 */
@Injectable({
  providedIn: 'root'
})
export class UnitStateService extends ElementCodeService {
  private _pagePresented = new Subject<number>();
  private presentedPages: number[] = [];
  private elementIdPageIndexMap: { [elementId: string]: number } = {};
  private ignoredPageIndexElementIds: string[] = [];
  private intersectionDetector: IntersectionDetector;
  private renderer: Renderer2;

  constructor(@Inject(DOCUMENT) private document: Document,
              private rendererFactory: RendererFactory2) {
    super();
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.intersectionDetector = this.createIntersectionDetector();
  }

  get pagePresented(): Observable<number> {
    return this._pagePresented.asObservable();
  }

  /**
   * How much of the unit has been seen, in the host's wording: `none` while no page is complete,
   * `complete` once every page with elements is, `some` in between.
   *
   * A unit whose elements carry no page index at all -- and one with no elements -- is `complete`:
   * there is nothing that could still be unseen.
   */
  get presentedPagesProgress(): Progress {
    if (this.elementPageIndices.length && !this.presentedPages.length) {
      return 'none';
    }
    return (this.elementPageIndices.length === this.presentedPages.length) ? 'complete' : 'some';
  }

  /**
   * Announces an element with its starting value, and -- given a DOM element -- has it watched, so that
   * scrolling it into view marks it as displayed.
   *
   * The page index decides whether the element counts towards its page being presented. `null` keeps it
   * out of that count, which is how an element that is not relevant for presentation completeness is
   * registered (`ElementGroupDirective`), and how children inside another element are.
   */
  registerElementCode(elementId: string,
                      elementAlias: string,
                      elementValue: ResponseValueType,
                      domElement: Element | null = null,
                      pageIndex: number | null = null): void {
    if (pageIndex !== null) {
      this.elementIdPageIndexMap[elementId] = pageIndex;
    } else {
      this.ignoredPageIndexElementIds.push(elementId);
    }
    this.addElementCode(elementId, elementAlias, elementValue, domElement);
  }

  /** Sets a status by id, logging it -- the way an element reports that it has been displayed. */
  changeElementCodeStatus(elementStatus: StatusChangeElement): void {
    LogService.debug(`player: changeElementStatus ${elementStatus.id}: ${elementStatus.status}`);
    this.setElementCodeStatus(elementStatus.id, elementStatus.status);
  }

  /** Clears everything for the next task: answers, page bookkeeping and the watching of the old DOM. */
  reset(): void {
    super.reset();
    this.presentedPages = [];
    this.elementIdPageIndexMap = {};
    this.ignoredPageIndexElementIds = [];
    /* Until it is disconnected, the detector of the previous unit keeps observing every element it
       was given -- and each of those keeps that unit's whole detached DOM alive (#1144). */
    this.intersectionDetector.destroy();
    this.intersectionDetector = this.createIntersectionDetector();
  }

  /** One subscription per detector, not one per element: the detector reports which element
     intersected, so a single handler can look that element up. */
  private createIntersectionDetector(): IntersectionDetector {
    const intersectionDetector = new IntersectionDetector(this.document, '0px 0px 0px 0px');
    intersectionDetector.intersecting
      .subscribe((id: string | null) => {
        if (id) {
          this.changeElementCodeStatus({ id: id, status: 'DISPLAYED' });
          intersectionDetector.unobserve(id);
        }
      });
    return intersectionDetector;
  }

  private addIntersectionDetection(elementId: string, domElement: Element): void {
    const elementToObserve = this.renderer.createElement('div');
    this.renderer.appendChild(domElement, elementToObserve);
    this.intersectionDetector.observe(elementToObserve, elementId);
  }

  private get elementPageIndices(): number[] {
    return Object.keys(this.elementIdPageIndexMap).reduce((elementPageIndices: number[], elementId: string) => {
      if (!elementPageIndices.includes(this.elementIdPageIndexMap[elementId])) {
        elementPageIndices.push(this.elementIdPageIndexMap[elementId]);
      }
      return elementPageIndices;
    }, []);
  }

  /**
   * Sets the status of an element's answer, with two rules the base class does not have.
   *
   * `VALUE_CHANGED` is final: an element that has been answered cannot fall back to `DISPLAYED`, and it
   * stops being watched, because being seen no longer says anything about it. The announcement goes out
   * either way, even when the status was left as it was. A status that ranks higher than the one before
   * can complete the element's page, which is checked here.
   */
  override setElementCodeStatus(id: string, status: ResponseStatusType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      const actualStatus = unitStateElementCode.status;
      if (actualStatus !== 'VALUE_CHANGED') {
        unitStateElementCode.status = status;
        if (status === 'VALUE_CHANGED') {
          this.intersectionDetector.unobserve(id);
        }
      }
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

  private addElementCode(id: string, alias: string, value: ResponseValueType, domElement: Element | null): void {
    let unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      // when reloading a unit, elementCodes are already pushed
      const status = domElement ? 'NOT_REACHED' : 'UNSET';
      unitStateElementCode = {
        id, alias, value, status
      };
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
