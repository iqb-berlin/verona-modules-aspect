import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  FormControlElement, FormControlValidators, FormGroupPage, ValueChangeElement
} from './form';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private _elementValueChanged = new Subject<ValueChangeElement>();
  private _controlAdded = new Subject<FormControlElement>();
  private _groupAdded = new Subject<FormGroupPage>();
  private _validationsAdded = new Subject<FormControlValidators>();

  get elementValueChanged(): Observable<ValueChangeElement> {
    return this._elementValueChanged.asObservable();
  }

  get controlAdded(): Observable<FormControlElement> {
    return this._controlAdded.asObservable();
  }

  get groupAdded(): Observable<FormGroupPage> {
    return this._groupAdded.asObservable();
  }

  get validationsAdded(): Observable<FormControlValidators> {
    return this._validationsAdded.asObservable();
  }

  changeElementValue(elementValues: ValueChangeElement): void {
    this._elementValueChanged.next(elementValues);
  }

  registerFormControl(control: FormControlElement): void {
    this._controlAdded.next(control);
  }

  registerFormGroup(group: FormGroupPage): void {
    this._groupAdded.next(group);
  }

  setValidators(validations: FormControlValidators): void {
    Promise.resolve().then(() => this._validationsAdded.next(validations));
  }
}
