import { Injectable } from '@angular/core';
import { ElementCodeService } from 'player/src/app/classes/element-code-service';
import { ResponseStatusType, ResponseValueType } from '@iqb/responses';
import { LogService } from 'player/modules/logging/services/log.service';

/**
 * The tracked variables of the geometry elements, in their own data part. They behave like answers, but
 * a GeoGebra applet reports its variables continuously, which is why the value is compared before
 * anything is announced.
 */
@Injectable({
  providedIn: 'root'
})
export class GeometryVariableStateService extends ElementCodeService {
  /**
   * Announces a tracked variable. Unlike the state variables these start as `NOT_REACHED` -- a geometry
   * variable is only shown once its applet is -- and the caller may say otherwise. An existing variable
   * keeps its value.
   */
  registerElementCode(elementId: string,
                      elementAlias: string,
                      elementValue: ResponseValueType,
                      status: ResponseStatusType = 'NOT_REACHED'): void {
    this.addElementCode(elementId, elementAlias, elementValue, status);
  }

  private addElementCode(id: string, alias: string, value: ResponseValueType, status: ResponseStatusType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (!unitStateElementCode) {
      this.addInitialElementCode({
        id, alias, value, status
      });
    }
  }

  /**
   * Like the base method, but a value equal to the one already held changes nothing and announces
   * nothing -- an applet reports on every interaction, including those that leave its variables where
   * they were.
   */
  override changeElementCodeValue(elementValue: { id: string, value: ResponseValueType }): void {
    const value = this.getElementCodeById(elementValue.id)?.value;
    if (value === elementValue.value) return;
    LogService.debug(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeValue(elementValue.id, elementValue.value);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
  }
}
