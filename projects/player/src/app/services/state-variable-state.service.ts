import { Injectable } from '@angular/core';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { ResponseValueType } from '@iqb/responses';

/**
 * The state variables of a unit -- values that belong to no element: what a trigger set, how long a
 * section has been waited for. They are reported to the host like answers, in their own data part.
 */
@Injectable({
  providedIn: 'root'
})
export class StateVariableStateService extends ElementCodeService {
  /**
   * Announces a state variable with its starting value. A variable declared in the unit brings its own
   * alias, which is the name the host sees; the two variables the player creates itself -- the section
   * delay timer and the visibility flag -- pass their id twice for want of another name. A variable that
   * already exists is left as it is, with the value it has, which makes this safe to call again after a
   * page change.
   */
  registerElementCode(elementId: string,
                      elementAlias: string,
                      elementValue: ResponseValueType): void {
    this.addElementCode(elementId, elementAlias, elementValue);
  }

  private addElementCode(id: string, alias: string, value: ResponseValueType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      this.addInitialElementCode({
        id, alias, value, status: 'UNSET'
      });
    }
  }
}
