import { IDTypes } from 'common/models/id-interfaces';
import { IDError } from 'common/classes/id-error';
import { VariableAlias } from 'common/utils/variable-alias';

export class IdRegistry {
  registeredIDs: string[] = [];

  getAndRegisterNewID(idType: IDTypes, unique: boolean = false): string {
    const id = unique ? this.getNewUniqueID(idType) : this.getNewID(idType);
    this.registerID(id);
    return id;
  }

  /**
   * Whether a name may be given out, which it may not if a registered one differs from it only in letter case: the
   * Verona contract keeps identifiers apart regardless of case (#1129). `except` is the name the asker holds
   * itself, so that `Wert` can become `wert`.
   */
  isIdAvailable(id: string, except?: string): boolean {
    const comparable = VariableAlias.toComparable(id);
    return !this.registeredIDs
      .some(registeredID => registeredID !== except && VariableAlias.toComparable(registeredID) === comparable);
  }

  /**
   * Whether exactly this name is registered. Bookkeeping asks this rather than `isIdAvailable`: a unit stored
   * before #1129 may hold `Wert` and `wert`, and both have to be registered so that releasing one does not free
   * the other.
   */
  isRegistered(id: string): boolean {
    return this.registeredIDs.includes(id);
  }

  registerID(id: string): void {
    if (this.isRegistered(id)) {
      throw new IDError(`ID already registered: ${id}`, 0, true, 'idAlreadyRegistered', { id });
    }
    this.registeredIDs.push(id);
  }

  unregisterID(id: string): void {
    const index = this.registeredIDs.indexOf(id);
    if (index !== -1) {
      this.registeredIDs.splice(index, 1);
    }
  }

  reset(): void {
    this.registeredIDs = [];
  }

  private getNewID(idType: IDTypes): string {
    let suffix = 1;
    let id = `${idType}_${suffix}`;
    while (!this.isIdAvailable(id)) {
      suffix += 1;
      id = `${idType}_${suffix}`;
    }
    return id;
  }

  private getNewUniqueID(idType: IDTypes): string {
    const suffix1 = Date.now();
    let suffix2 = 1;
    let id = `${idType}_${suffix1}_${suffix2}`;
    while (!this.isIdAvailable(id)) {
      suffix2 += 1;
      id = `${idType}_${suffix1}_${suffix2}`;
    }
    return id;
  }
}
