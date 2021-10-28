import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  FormControlElement, FormControlValidators, ChildFormGroup
} from '../models/form';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private _controlAdded = new Subject<FormControlElement>();
  private _groupAdded = new Subject<ChildFormGroup>();
  private _validatorsAdded = new Subject<FormControlValidators>();

  get controlAdded(): Observable<FormControlElement> {
    return this._controlAdded.asObservable();
  }

  get groupAdded(): Observable<ChildFormGroup> {
    return this._groupAdded.asObservable();
  }

  get validatorsAdded(): Observable<FormControlValidators> {
    return this._validatorsAdded.asObservable();
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
}
