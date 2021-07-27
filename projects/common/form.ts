import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';

export interface ValueChangeElement {
  id: string;
  values: [string | number | boolean | undefined, string | number | boolean];
}

export interface FormControlElement {
  id: string;
  formControl: FormControl;
  formGroup: FormGroup;
}

export interface FormControlValidators {
  id: string;
  validators: ValidatorFn[];
  formGroup: FormGroup;
}

export interface FormGroupPage {
  id: string;
  formGroup: FormGroup;
}
