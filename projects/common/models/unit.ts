import { Page } from 'common/models/page';
import { UIElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { VersionManager } from 'common/services/version-manager';
import { InstantiationEror } from 'common/util/errors';
import { ArrayUtils } from 'common/util/array';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

export class Unit implements UnitProperties {
  type = 'aspect-unit-definition';
  version: string;
  stateVariables: StateVariable[] = [];
  pages: Page[];

  constructor(unit?: UnitProperties) {
    if (unit && isValid(unit)) {
      this.version = unit.version;
      this.stateVariables = unit.stateVariables;
      this.pages = unit.pages.map(page => new Page(page));
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at unit instantiation');
      }
      this.version = VersionManager.getCurrentVersion();
      if (unit?.stateVariables !== undefined) this.stateVariables = unit.stateVariables;
      this.pages = unit?.pages.map(page => new Page(page)) || [new Page()];
    }
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.pages.map(page => page.getAllElements(elementType)).flat();
  }

  getVariableInfos(): VariableInfo[] {
    const dropLists: DropListElement[] = [
      ...this.getAllElements('drop-list') as DropListElement[]
    ];
    return this.pages.map(page => page.getVariableInfos(dropLists)).flat();
  }
}

function isValid(blueprint?: UnitProperties): boolean {
  if (!blueprint) return false;
  return blueprint.version === VersionManager.getCurrentVersion() &&
    blueprint.stateVariables !== undefined &&
    blueprint.type !== undefined &&
    blueprint.pages !== undefined;
}

export interface UnitProperties {
  type: string;
  version: string;
  stateVariables: StateVariable[];
  pages: Page[];
}
