import { Injectable } from '@angular/core';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { ElementCodeValue } from 'player/modules/verona/models/verona';

@Injectable({
  providedIn: 'root'
})
export class StateVariableStateService extends ElementCodeService {
  registerElementCode(elementId: string,
                      elementValue: ElementCodeValue): void {
    this.addElementCode(elementId, elementValue);
  }

  private addElementCode(id: string, value: ElementCodeValue): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      this.addInitialElementCode({ id, value, status: 'UNSET' });
    }
  }
}
