import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Progress } from 'verona/models/verona';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  private formControls: FormControl[] = [];

  get responseProgress(): Progress {
    // TODO wenn am ende nur die Länge interessiert, warum dann erstmal
    //  alle formControls in der Variable speichern?
    const validFormControls = this.formControls
      .filter(control => control.valid && control.value !== '' && control.value !== null);
    if (validFormControls.length === this.formControls.length) {
      return 'complete';
    }
    return validFormControls.some(control => control.valid) ? 'some' : 'none';
  }

  registerFormControl(control: FormControl): void {
    // TODO wie ist das Scenario in dem das Control schon drin ist?
    //  Lieber an der Wurzel beheben, als hier Fehler verschlucken!
    if (!this.formControls.includes(control)) {
      this.formControls.push(control);
    }
  }

  reset(): void {
    this.formControls = [];
  }
}
