import { Injectable } from '@angular/core';
import { IDTypes } from 'common/interfaces';
import { IdRegistry } from 'editor/src/app/services/id-registry';

@Injectable({
  providedIn: 'root'
})
export class IDService {
  idRegistry = new IdRegistry();
  aliasRegistry = new IdRegistry();

  getAndRegisterNewIDs(idType: IDTypes): { id: string, alias: string } {
    return {
      id: this.idRegistry.getAndRegisterNewID(idType, true),
      alias: this.aliasRegistry.getAndRegisterNewID(idType)
    };
  }

  getAndRegisterNewID(idType: IDTypes, isAlias: boolean = false): string {
    return isAlias ? this.aliasRegistry.getAndRegisterNewID(idType) : this.idRegistry.getAndRegisterNewID(idType, true);
  }

  isIDAvailable(id: string, idType: IDTypes): boolean {
    return this.idRegistry.isIdAvailable(id, idType);
  }

  isAliasAvailable(id: string, idType: IDTypes): boolean {
    return this.aliasRegistry.isIdAvailable(id, idType);
  }

  changeAlias(oldID: string, newID: string, idType: IDTypes): void {
    this.unregister(oldID, idType, false, true);
    this.register(newID, idType, false, true);
  }

  register(id: string, idType: IDTypes, useIDRegistry: boolean, useAliasRegistry: boolean) {
    if (useIDRegistry) this.idRegistry.registerID(id, idType);
    if (useAliasRegistry) this.aliasRegistry.registerID(id, idType);
  }

  unregister(id: string, idType: IDTypes, useIDRegistry: boolean, useAliasRegistry: boolean): void {
    if (useIDRegistry) this.idRegistry.unregisterID(id, idType);
    if (useAliasRegistry) this.aliasRegistry.unregisterID(id, idType);
  }

  reset(): void {
    this.idRegistry.reset();
    this.aliasRegistry.reset();
  }
}
