import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  elementValueChanged = new Subject<any>();
  controlAdded = new Subject<string>();

  get elementValueChanged$(): Observable<any[]> {
    return this.elementValueChanged.asObservable();
  }

  get controlAdded$(): Observable<string> {
    return this.controlAdded.asObservable();
  }
}
