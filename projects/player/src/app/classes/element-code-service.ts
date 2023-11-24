import { ElementCode, ElementCodeStatus, ElementCodeValue } from 'player/modules/verona/models/verona';
import { Observable, Subject } from 'rxjs';
import { LogService } from 'player/modules/logging/services/log.service';

export abstract class ElementCodeService {
  elementCodes: ElementCode[] = [];
  protected _elementCodeChanged = new Subject<ElementCode>();

  getElementCodeById(id: string): ElementCode | undefined {
    return this.elementCodes
      .find((elementCode: ElementCode): boolean => elementCode.id === id);
  }

  get elementCodeChanged(): Observable<ElementCode> {
    return this._elementCodeChanged.asObservable();
  }

  changeElementCodeValue(elementValue: { id: string, value: ElementCodeValue }): void {
    LogService.debug(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeValue(elementValue.id, elementValue.value);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
  }

  setElementCodeStatus(id: string, status: ElementCodeStatus): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.status = status;
      this._elementCodeChanged.next(unitStateElementCode);
    }
  }

  reset(): void {
    this.elementCodes = [];
  }

  protected addInitialElementCode(unitStateElementCode: ElementCode): void {
    this.elementCodes.push(unitStateElementCode);
    this._elementCodeChanged.next(unitStateElementCode);
  }

  protected setElementCodeValue(id: string, value: ElementCodeValue): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
    }
  }
}
