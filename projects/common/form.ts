import { FormControl } from '@angular/forms';

export interface ValueChangeElement {
  id: string;
  values: [unknown, unknown];
}

export interface FormControlElement {
  id: string;
  formControl: FormControl;
}
