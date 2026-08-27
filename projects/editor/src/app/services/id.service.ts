import { Injectable } from '@angular/core';
import { IDTypes } from 'common/models/id-interfaces';
import { IdRegistry } from 'editor/src/app/classes/id-registry';

/**
 * Hands out the names of a unit and remembers which are taken. Two registries, kept apart on purpose:
 * an id has to be unique among ids, an alias among aliases, and the same word may serve as both.
 *
 * Everything here works on the unit currently open. A task change goes through `reset`, or the names of
 * the unit just left would still count as taken.
 */
@Injectable({
  providedIn: 'root'
})
export class IDService {
  idRegistry = new IdRegistry();
  aliasRegistry = new IdRegistry();

  /** A fresh id and a fresh alias for a new element, both registered. */
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

  /** Frees the old alias and takes the new one. Both steps touch the alias registry only, so an element
      keeps its id when its alias changes. */
  changeAlias(oldID: string, newID: string): void {
    this.unregister(oldID, false, true);
    this.register(newID, false, true);
  }

  /** Marks a name as taken, in either registry or both. A name that is already taken is silently left
      as it is, so this cannot be used to find out whether it was free -- ask `isIDAvailable` for that. */
  register(id: string, useIDRegistry: boolean, useAliasRegistry: boolean) {
    if (useIDRegistry && this.isIDAvailable(id)) this.idRegistry.registerID(id);
    if (useAliasRegistry && this.isAliasAvailable(id)) this.aliasRegistry.registerID(id);
  }

  /** Gives a name back, so the id of a deleted element can be used again. Unlike `register` this does
      not check first: unregistering a name nobody holds is silently accepted. */
  unregister(id: string, useIDRegistry: boolean, useAliasRegistry: boolean): void {
    if (useIDRegistry) this.idRegistry.unregisterID(id);
    if (useAliasRegistry) this.aliasRegistry.unregisterID(id);
  }

  reset(): void {
    this.idRegistry.reset();
    this.aliasRegistry.reset();
  }
}
