import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormControlElement, ValueChangeElement } from './form';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private _elementValueChanged = new Subject<ValueChangeElement>();
  private _controlAdded = new Subject<FormControlElement>();

  get elementValueChanged(): Observable<ValueChangeElement> {
    return this._elementValueChanged.asObservable();
  }

  get controlAdded(): Observable<FormControlElement> {
    return this._controlAdded.asObservable();
  }

  changeElementValue(elementValues: ValueChangeElement): void {
    this._elementValueChanged.next(elementValues);
  }

  registerFormControl(control: FormControlElement): void {
    this._controlAdded.next(control);
  }
}
