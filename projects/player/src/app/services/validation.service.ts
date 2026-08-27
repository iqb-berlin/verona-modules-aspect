import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Progress } from 'player/modules/verona/models/verona';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private formControls: UntypedFormControl[] = [];

  /** Answered from the controls on every read, so a response that is taken back -- a cleared field, a
     deselected hotspot -- lowers the progress again. A remembered `complete` never came down (#1354),
     which also kept the host from denying navigation, and it is that denial the player waits for
     before it shows any "input required" message.

     A unit whose elements need no validation has no controls here and counts as complete: there is
     nothing left to answer. */
  get responseProgress(): Progress {
    const validControls = this.formControls.filter(control => control.valid);
    if (validControls.length === this.formControls.length) return 'complete';
    return validControls.length ? 'some' : 'none';
  }

  registerFormControl(control: UntypedFormControl): void {
    this.formControls.push(control);
  }

  reset(): void {
    this.formControls = [];
  }
}
