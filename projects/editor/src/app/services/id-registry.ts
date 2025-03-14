import { IDTypes } from 'common/interfaces';

export class IdRegistry {
  registeredIDs: { [key in IDTypes]?: string[] } = {};

  getAndRegisterNewID(idType: IDTypes, unique: boolean = false): string {
    const id = unique ? this.getNewUniqueID(idType) : this.getNewID(idType);
    this.registerID(id, idType);
    return id;
  }

  isIdAvailable(id: string, idType: IDTypes): boolean {
    return !this.registeredIDs[idType]?.includes(id);
  }

  registerID(id: string, idType: IDTypes): void {
    if (this.registeredIDs[idType]?.includes(id)) throw new Error(`ID already registered: ${id}`);
    (this.registeredIDs[idType] ??= []).push(id);
  }

  unregisterID(id: string, idType: IDTypes): void {
    const registeredElementIDs = this.registeredIDs[idType];
    if (registeredElementIDs) {
      registeredElementIDs.splice(registeredElementIDs.indexOf(id, 0), 1);
    }
  }

  reset(): void {
    this.registeredIDs = {};
  }

  private getNewID(idType: IDTypes): string {
    let suffix = 1;
    let id = `${idType}_${suffix}`;
    while (!this.isIdAvailable(id, idType)) {
      suffix += 1;
      id = `${idType}_${suffix}`;
    }
    return id;
  }

  private getNewUniqueID(idType: IDTypes): string {
    const suffix1 = Date.now();
    let suffix2 = 1;
    let id = `${idType}_${suffix1}_${suffix2}`;
    while (!this.isIdAvailable(id, idType)) {
      suffix2 += 1;
      id = `${idType}_${suffix1}_${suffix2}`;
    }
    return id;
  }
}
