import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChangeElement } from './unit';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private elementValueChanged = new Subject<ChangeElement>();
  private controlAdded = new Subject<string>();

  get elementValueChanged$(): Observable<ChangeElement> {
    return this.elementValueChanged.asObservable();
  }

  get controlAdded$(): Observable<string> {
    return this.controlAdded.asObservable();
  }

  changeElementValue(elementValues: ChangeElement): void {
    this.elementValueChanged.next(elementValues);
  }

  registerFormControl(controlId: string): void {
    this.controlAdded.next(controlId);
  }
}
