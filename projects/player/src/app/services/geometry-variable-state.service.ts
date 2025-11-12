import { Injectable } from '@angular/core';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { ResponseValueType } from '@iqb/responses';
import { LogService } from 'player/modules/logging/services/log.service';

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

  override changeElementCodeValue(elementValue: { id: string, value: ResponseValueType }): void {
    const value = this.getElementCodeById(elementValue.id)?.value;
    if (value === elementValue.value) return;
    LogService.debug(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeValue(elementValue.id, elementValue.value);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
  }
}
