import { Injectable } from '@angular/core';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { ResponseValueType } from '@iqb/responses';

@Injectable({
  providedIn: 'root'
})
export class GeometryVariableStateService extends ElementCodeService {
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
