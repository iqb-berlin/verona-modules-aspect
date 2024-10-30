import { IDTypes } from 'common/interfaces';

export class IdRegistry {
  registeredIDs: { [key in IDTypes]?: string[] } = {};

  getAndRegisterNewID(idType: IDTypes): string {
    const id = this.getNextFreeID(idType);
    this.registerID(id, idType);
    return id;
  }

  isIdAvailable(id: string, idType: IDTypes): boolean {
    return !this.registeredIDs[idType]?.includes(id);
  }

  registerID(id: string, idType: IDTypes): void {
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

  private getNextFreeID(idType: IDTypes): string {
    let suffix = 1;
    let id = `${idType}_${suffix}`;
    while (!this.isIdAvailable(id, idType)) {
      suffix += 1;
      id = `${idType}_${suffix}`;
    }
    return id;
  }
}
