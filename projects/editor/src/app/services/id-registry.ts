import { IDTypes } from 'common/interfaces';

export class IdRegistry {
  registeredIDs: string[] = [];

  getAndRegisterNewID(idType: IDTypes, unique: boolean = false): string {
    const id = unique ? this.getNewUniqueID(idType) : this.getNewID(idType);
    this.registerID(id);
    return id;
  }

  isIdAvailable(id: string): boolean {
    return !this.registeredIDs.includes(id);
  }

  registerID(id: string): void {
    if (!this.isIdAvailable(id)) throw new Error(`ID already registered: ${id}`);
    this.registeredIDs.push(id);
  }

  unregisterID(id: string): void {
    this.registeredIDs.splice(this.registeredIDs.indexOf(id), 1);
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
