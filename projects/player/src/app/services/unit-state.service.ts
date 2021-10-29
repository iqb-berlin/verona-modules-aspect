import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  StatusChangeElement,
  UnitStateElementCode,
  UnitStateElementCodeStatus,
  UnitStateElementCodeStatusValue
} from '../models/verona';
import {
  InputElement, InputElementValue, UIElement, ValueChangeElement
} from '../../../../common/models/uI-element';
import { TextElement } from '../../../../common/models/text-element';
import { VideoElement } from '../../../../common/models/video-element';
import { AudioElement } from '../../../../common/models/audio-element';
import { IntersectionDetector } from '../classes/intersection-detector';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _presentedPageAdded = new Subject<number>();
  private _unitStateElementCodeChanged = new Subject<UnitStateElementCode>();
  private intersectionDetector!: IntersectionDetector;
  unitStateElementCodes!: UnitStateElementCode[];

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.intersectionDetector = new IntersectionDetector(document);
  }

  private getUnitStateElement(id: string): UnitStateElementCode | undefined {
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

  registerElement(elementModel: UIElement, element: Element): void {
    this.initUnitStateValue(elementModel);
    this.intersectionDetector.observe(elementModel.id, element);
    this.intersectionDetector.intersecting
      .subscribe((id: string) => {
        this.changeElementStatus({ id: id, status: 'DISPLAYED' });
      });
  }

  restoreUnitStateValue(elementModel: UIElement): UIElement {
    const unitStateElementCode = this.getUnitStateElement(elementModel.id);
    if (unitStateElementCode && unitStateElementCode.value !== undefined) {
      switch (elementModel.type) {
        case 'text':
          elementModel.text = unitStateElementCode.value;
          break;
        case 'video':
        case 'audio':
          elementModel.playbackTime = unitStateElementCode.value;
          break;
        default:
          elementModel.value = unitStateElementCode.value;
      }
    }
    return elementModel;
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

  private initUnitStateValue(elementModel: UIElement): void {
    switch (elementModel.type) {
      case 'text':
        this.addUnitStateElementCode(elementModel.id, (elementModel as TextElement).text);
        break;
      case 'video':
        this.addUnitStateElementCode(elementModel.id, (elementModel as VideoElement).playbackTime);
        break;
      case 'audio':
        this.addUnitStateElementCode(elementModel.id, (elementModel as AudioElement).playbackTime);
        break;
      default:
        this.addUnitStateElementCode(elementModel.id, (elementModel as InputElement).value);
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
