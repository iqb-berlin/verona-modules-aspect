import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChangeElement } from './unit';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private _elementValueChanged = new Subject<ChangeElement>();
  private _controlAdded = new Subject<string>();

  get elementValueChanged(): Observable<ChangeElement> {
    return this._elementValueChanged.asObservable();
  }

  get controlAdded(): Observable<string> {
    return this._controlAdded.asObservable();
  }

  changeElementValue(elementValues: ChangeElement): void {
    this._elementValueChanged.next(elementValues);
  }

  registerFormControl(controlId: string): void {
    this._controlAdded.next(controlId);
  }
}
