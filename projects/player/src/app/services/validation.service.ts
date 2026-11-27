import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Progress } from 'player/modules/verona/models/verona';

/**
 * How far the required answers of a task are given, which is what the host uses to allow or refuse
 * navigating on. Every validated element registers its form control here; the service knows the
 * controls, not the elements.
 */
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
     nothing left to answer. A disabled control is left out the same way: the write protection of a
     slider or a toggle button disables it (`IsDisabledDirective`), nobody can answer it, and Angular
     never counts a disabled control as valid, so a read-only required element held the progress below
     complete for good (#1735). */
  get responseProgress(): Progress {
    const answerableControls = this.formControls.filter(control => !control.disabled);
    const validControls = answerableControls.filter(control => control.valid);
    if (validControls.length === answerableControls.length) return 'complete';
    return validControls.length ? 'some' : 'none';
  }

  /** Adds a control to the count. Controls without a validator are always valid and thus never hold the
      progress back -- an optional answer costs nothing here. */
  registerFormControl(control: UntypedFormControl): void {
    this.formControls.push(control);
  }

  /** Forgets every control, for the next task. Without this the controls of the task just left would go
      on deciding the progress of the next one. */
  reset(): void {
    this.formControls = [];
  }
}
