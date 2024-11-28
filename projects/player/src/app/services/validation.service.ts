import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Progress } from 'player/modules/verona/models/verona';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private formControls: UntypedFormControl[] = [];
  private progress: Progress = 'none';

  get responseProgress(): Progress {
    if (this.progress !== 'complete') {
      this.setProgress();
    }
    return this.progress;
  }

  private setProgress(): void {
    const validFormControls = this.formControls
      .filter(control => control.valid);
    if (validFormControls.length === this.formControls.length) {
      this.progress = 'complete';
    } else {
      this.progress = validFormControls.some(control => control.valid) ? 'some' : 'none';
    }
  }

  registerFormControl(control: UntypedFormControl): void {
    this.formControls.push(control);
  }

  reset(): void {
    this.formControls = [];
    this.progress = 'none';
  }
}
