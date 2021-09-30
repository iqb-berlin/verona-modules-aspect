import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  FormControlElement, FormControlValidators, ChildFormGroup
} from './form';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private _controlAdded = new Subject<FormControlElement>();
  private _groupAdded = new Subject<ChildFormGroup>();
  private _validatorsAdded = new Subject<FormControlValidators>();
  private _presentedPageAdded = new Subject<number>();

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

  registerFormControl(control: FormControlElement): void {
    this._controlAdded.next(control);
  }

  registerFormGroup(group: ChildFormGroup): void {
    this._groupAdded.next(group);
  }

  setValidators(validators: FormControlValidators): void {
    this._validatorsAdded.next(validators);
  }

  addPresentedPage(presentedPage: number): void {
    this._presentedPageAdded.next(presentedPage);
  }
}
