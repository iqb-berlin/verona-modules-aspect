import { FormControl } from '@angular/forms';

export interface ValueChangeElement {
  id: string;
  values: [string | number | boolean | undefined, string | number | boolean];
}

export interface FormControlElement {
  id: string;
  formControl: FormControl;
}
