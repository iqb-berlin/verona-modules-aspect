import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UnitUIElement } from '../../../../common/unit';

@Injectable({
  providedIn: 'root'
})
export class UnitStateService {
  private _elementAdded = new Subject<UnitUIElement>();
  private _presentedPageAdded = new Subject<number>();

  get elementAdded(): Observable<UnitUIElement> {
    return this._elementAdded.asObservable();
  }

  get presentedPageAdded(): Observable<number> {
    return this._presentedPageAdded.asObservable();
  }

  registerElement(element: UnitUIElement): void {
    this._elementAdded.next(element);
  }

  addPresentedPage(presentedPage: number): void {
    this._presentedPageAdded.next(presentedPage);
  }
}
