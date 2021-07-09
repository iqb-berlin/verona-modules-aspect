import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  elementValueChanged = new Subject<any>();
  controlAdded = new Subject<string>();
  isPlayer: boolean = false;
  formRef!: FormGroup;

  get elementValueChanged$(): Observable<any[]> {
    return this.elementValueChanged.asObservable();
  }

  get controlAdded$(): Observable<string> {
    return this.controlAdded.asObservable();
  }

  getFormControlPath(id: string): FormControl {
    return (this.formRef) ? this.formRef.controls[id] as FormControl : new FormControl();
  }
}
