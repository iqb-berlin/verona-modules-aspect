import { Injectable } from '@angular/core';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { InputElementValue } from 'common/models/elements/element';

@Injectable({
  providedIn: 'root'
})
export class StateVariableStateService extends ElementCodeService {
  registerElementCode(elementId: string,
                      elementValue: InputElementValue): void {
    this.addElementCode(elementId, elementValue);
  }

  private addElementCode(id: string, value: InputElementValue): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      this.addInitialElementCode({ id, value, status: 'UNSET' });
    }
  }
}
