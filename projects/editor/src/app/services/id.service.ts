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

  isIDAvailable(id: string): boolean {
    return this.idRegistry.isIdAvailable(id);
  }

  isAliasAvailable(id: string): boolean {
    return this.aliasRegistry.isIdAvailable(id);
  }

  changeAlias(oldID: string, newID: string): void {
    this.unregister(oldID, false, true);
    this.register(newID, false, true);
  }

  register(id: string, useIDRegistry: boolean, useAliasRegistry: boolean) {
    if (useIDRegistry) this.idRegistry.registerID(id);
    if (useAliasRegistry) this.aliasRegistry.registerID(id);
  }

  unregister(id: string, useIDRegistry: boolean, useAliasRegistry: boolean): void {
    if (useIDRegistry) this.idRegistry.unregisterID(id);
    if (useAliasRegistry) this.aliasRegistry.unregisterID(id);
  }

  reset(): void {
    this.idRegistry.reset();
    this.aliasRegistry.reset();
  }
}
