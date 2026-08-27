import { Observable, Subject } from 'rxjs';
import { LogService } from 'player/modules/logging/services/log.service';
import { Response, ResponseStatusType, ResponseValueType } from '@iqb/responses';

/**
 * The answers of one kind -- element values, state variables, geometry variables -- as the player keeps
 * them, and the base of the three services that do.
 *
 * Every answer carries two names: the `id` an element has inside the unit, and the `alias` it is known
 * by outside. Everything within the player looks answers up by `id`; everything that leaves for the host
 * is keyed by `alias`.
 */
export abstract class ElementCodeService {
  elementCodes: (Response & { alias: string })[] = [];
  protected _elementCodeChanged = new Subject<Response & { alias: string }>();

  /** The answers as the host is given them: keyed by `alias`, which becomes the `id` of the response. */
  getResponses(): Response[] {
    return this.elementCodes.map((elementCode => ({
      id: elementCode.alias, status: elementCode.status, value: elementCode.value
    })));
  }

  /**
   * Takes over the answers the host restored, translating their `id` -- which is an alias -- back into
   * the internal id via `idsWithAlias`. An alias the table does not know keeps its own name as the id;
   * the entry then belongs to no element, and the element it once belonged to registers a second,
   * empty one of its own. Replaces everything held so far.
   */
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

  isElementCodeRegistered(id: string): boolean {
    return this.elementCodes
      .some((elementCode: Response & { alias: string }): boolean => elementCode.id === id);
  }

  get elementCodeChanged(): Observable<Response & { alias: string }> {
    return this._elementCodeChanged.asObservable();
  }

  /**
   * Writes a new value and sets the status to `VALUE_CHANGED`. An id that is not registered is ignored
   * -- no answer is created for it, and nothing is emitted.
   */
  changeElementCodeValue(elementValue: { id: string, value: ResponseValueType }): void {
    LogService.debug(`player: changeElementValue ${elementValue.id}: ${elementValue.value}`);
    this.setElementCodeValue(elementValue.id, elementValue.value);
    this.setElementCodeStatus(elementValue.id, 'VALUE_CHANGED');
  }

  /**
   * Sets the status of a registered answer and announces it; an unknown id is ignored.
   *
   * `UnitStateService` overrides this: there a status is final once it is `VALUE_CHANGED`, and the
   * announcement goes out even when nothing changed.
   */
  setElementCodeStatus(id: string, status: ResponseStatusType): void {
    const unitStateElementCode = this.getElementCodeById(id);
    if (unitStateElementCode) {
      unitStateElementCode.status = status;
      this._elementCodeChanged.next(unitStateElementCode);
    }
  }

  /** Drops every answer, for the next task. The change stream stays open and is reused. */
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
