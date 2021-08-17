import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  FormControlElement, FormControlValidators, ChildFormGroup, ValueChangeElement
} from './form';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private _elementValueChanged = new Subject<ValueChangeElement>();
  private _controlAdded = new Subject<FormControlElement>();
  private _groupAdded = new Subject<ChildFormGroup>();
  private _validatorsAdded = new Subject<FormControlValidators>();
  private _presentedPageAdded = new Subject<number>();

  get elementValueChanged(): Observable<ValueChangeElement> {
    return this._elementValueChanged.asObservable();
  }

  get controlAdded(): Observable<FormControlElement> {
    return this._controlAdded.asObservable();
  }

  get groupAdded(): Observable<ChildFormGroup> {
    return this._groupAdded.asObservable();
  }

  get validatorsAdded(): Observable<FormControlValidators> {
    return this._validatorsAdded.asObservable();
  }

  get presentedPageAdded(): Observable<number> {
    return this._presentedPageAdded.asObservable();
  }

  changeElementValue(elementValues: ValueChangeElement): void {
    this._elementValueChanged.next(elementValues);
  }

  registerFormControl(control: FormControlElement): void {
    this._controlAdded.next(control);
  }

  registerFormGroup(group: ChildFormGroup): void {
    this._groupAdded.next(group);
  }

  setValidators(validations: FormControlValidators): void {
    this._validatorsAdded.next(validations);
  }

  addPresentedPage(presentedPage: number): void {
    this._presentedPageAdded.next(presentedPage);
  }
}
