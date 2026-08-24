import { UIElementType } from 'common/models/ui-element-interfaces';

export type IDTypes = UIElementType | 'value' | 'state-variable';

export interface AbstractIDService {
  getAndRegisterNewID: (idType: IDTypes, alias?: boolean) => string;
  register: (id: string, useIDRegistry: boolean, useAliasRegistry: boolean) => void;
  unregister: (id: string, useIDRegistry: boolean, useAliasRegistry: boolean) => void;
  isAliasAvailable: (id: string) => boolean;
  changeAlias: (oldID: string, newID: string) => void
}
