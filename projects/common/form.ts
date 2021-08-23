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

export interface ChildFormGroup {
  formGroup: FormGroup;
  parentForm: FormGroup;
  parentArray: 'pages' | 'sections' | 'elements';
  parentArrayIndex: number;
}

export interface FormSection {
  elements: Record<string, string | number | boolean | undefined>[];
}

export interface FormPage {
  sections: FormSection[];
  id?: string;
}
