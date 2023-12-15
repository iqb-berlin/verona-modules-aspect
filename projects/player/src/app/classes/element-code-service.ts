import { Observable, Subject } from 'rxjs';
import { LogService } from 'player/modules/logging/services/log.service';
import { Response, ResponseStatusType, ResponseValueType } from '@iqb/responses';

export abstract class ElementCodeService {
  elementCodes: Response[] = [];
  protected _elementCodeChanged = new Subject<Response>();

  getElementCodeById(id: string): Response | undefined {
    return this.elementCodes
      .find((elementCode: Response): boolean => elementCode.id === id);
  }

  get elementCodeChanged(): Observable<Response> {
    return this._elementCodeChanged.asObservable();
  }

  changeElementCodeValue(elementValue: { id: string, value: ResponseValueType }): void {
    LogService.debug(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeValue(elementValue.id, elementValue.value);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
  }

  setElementCodeStatus(id: string, status: ResponseStatusType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.status = status;
      this._elementCodeChanged.next(unitStateElementCode);
    }
  }

  reset(): void {
    this.elementCodes = [];
  }

  protected addInitialElementCode(unitStateElementCode: Response): void {
    this.elementCodes.push(unitStateElementCode);
    this._elementCodeChanged.next(unitStateElementCode);
  }

  protected setElementCodeValue(id: string, value: ResponseValueType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
    }
  }
}
