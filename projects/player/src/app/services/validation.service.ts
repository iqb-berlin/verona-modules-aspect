import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Progress } from 'player/modules/verona/models/verona';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private formControls: FormControl[] = [];

  get responseProgress(): Progress {
    const validFormControls = this.formControls
      .filter(control => control.valid && control.value !== '' && control.value !== null);
    if (validFormControls.length === this.formControls.length) {
      return 'complete';
    }
    return validFormControls.some(control => control.valid) ? 'some' : 'none';
  }

  registerFormControl(control: FormControl): void {
    this.formControls.push(control);
  }

  reset(): void {
    this.formControls = [];
  }
}
