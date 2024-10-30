import { Observable, Subject } from 'rxjs';
import { LogService } from 'player/modules/logging/services/log.service';
import { Response, ResponseStatusType, ResponseValueType } from '@iqb/responses';

export abstract class ElementCodeService {
  elementCodes: (Response & { alias: string })[] = [];
  protected _elementCodeChanged = new Subject<Response & { alias: string }>();

  getResponses(): Response[] {
    return this.elementCodes.map((elementCode => ({
      id: elementCode.alias, status: elementCode.status, value: elementCode.value
    })));
  }

  setElementCodes(responses: Response[], idsWithAlias: { id: string; alias: string }[]) {
    this.elementCodes = responses.map((response: Response): Response & { alias: string } => ({
      id: idsWithAlias.find((idWithAlias): boolean => idWithAlias.alias === response.id)?.id || response.id,
      alias: response.id,
      status: response.status,
      value: response.value
    }));
  }

  getElementCodeById(id: string): Response & { alias: string } | undefined {
    return this.elementCodes
      .find((elementCode: Response & { alias: string }): boolean => elementCode.id === id);
  }

  get elementCodeChanged(): Observable<Response & { alias: string }> {
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

  protected addInitialElementCode(unitStateElementCode: Response & { alias: string }): void {
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
