import { Page, PageProperties } from 'common/models/page';
import { Section } from 'common/models/section';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { UIElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { StateVariable } from 'common/models/state-variable';
import { environment } from 'common/environment';
import { VersionManager } from 'common/services/version-manager';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';
import { IDService } from 'editor/src/app/services/id.service';

export class Unit implements UnitProperties {
  type = 'aspect-unit-definition';
  version: string;
  stateVariables: StateVariable[] = [];
  pages: Page[];
  enableSectionNumbering: boolean = false;
  sectionNumberingPosition: 'left' | 'above' = 'left';
  showUnitNavNext: boolean = false;

  constructor(unit?: UnitProperties, idService?: AbstractIDService) {
    if (unit && isValid(unit)) {
      this.version = unit.version;
      this.stateVariables = unit.stateVariables
        .map(variable => new StateVariable(variable.id, variable.alias ?? variable.id, variable.value));
      this.pages = this.createPages(unit, idService);
      this.enableSectionNumbering = unit.enableSectionNumbering;
      this.sectionNumberingPosition = unit.sectionNumberingPosition;
      this.showUnitNavNext = unit.showUnitNavNext;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at unit instantiation');
      }
      this.version = VersionManager.getCurrentVersion();
      if (unit?.stateVariables !== undefined) {
        this.stateVariables = unit.stateVariables
          .map(variable => new StateVariable(variable.id, variable.alias ?? variable.id, variable.value));
      }
      this.pages = this.createPages(unit, idService);
      if (unit?.enableSectionNumbering !== undefined) this.enableSectionNumbering = unit.enableSectionNumbering;
      if (unit?.sectionNumberingPosition !== undefined) this.sectionNumberingPosition = unit.sectionNumberingPosition;
      if (unit?.showUnitNavNext !== undefined) this.showUnitNavNext = unit.showUnitNavNext;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected createPages(unit?: UnitProperties, idService?: AbstractIDService): Page[] {
    return unit?.pages.map(page => new Page(page, idService)) ||
        [new Page(undefined, idService)];
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.pages.map(page => page.getAllElements(elementType)).flat();
  }

  /**
   * The section that holds an element, asked of the unit rather than of the editor's selection
   * indices: those are written in several places and can name another section than the one the
   * element is in (#1204).
   *
   * The element itself is the truth here, not the selection: a cross-section drag moves the element
   * and then writes its position in the same synchronous block, before the overlays are rebuilt, so
   * the selection still describes where the element came from.
   *
   * Compound children resolve to the section of their parent, and an element that is not in the unit
   * at all resolves to undefined.
   */
  getSectionOfElement(element: UIElement): Section | undefined {
    const sections = this.pages.map(page => page.sections).flat();
    /* The section's own list first: that is the answer for every element the section places, and it
       costs a lookup instead of building the list of children as well. Only a compound child falls
       through to the second pass, which reaches it. */
    return sections.find(section => section.elements.includes(element as PositionedUIElement)) ||
      sections.find(section => section.getAllElements().includes(element));
  }

  getVariableInfos(): VariableInfo[] {
    const dropLists: DropListElement[] = [
      ...this.getAllElements('drop-list') as DropListElement[]
    ];
    return [
      ...this.stateVariables.map(v => v.getVariableInfo()),
      ...this.pages.map(page => page.getVariableInfos(dropLists)).flat()
    ];
  }

  deletePage(pageIndex: number): void {
    this.pages.splice(pageIndex, 1);
  }

  movePageToFront(pageIndex: number) {
    const page = this.pages.splice(pageIndex, 1);
    this.pages.splice(0, 0, page[0]);
  }
}

function isValid(blueprint?: UnitProperties): boolean {
  if (!blueprint) return false;
  if (blueprint.stateVariables !== undefined &&
      blueprint.stateVariables.length > 0 &&
      blueprint.stateVariables[0].alias === undefined) {
    return false;
  }
  return blueprint.version === VersionManager.getCurrentVersion() &&
    blueprint.stateVariables !== undefined &&
    blueprint.type !== undefined &&
    blueprint.pages !== undefined &&
    blueprint.enableSectionNumbering !== undefined &&
    blueprint.sectionNumberingPosition !== undefined &&
    blueprint.showUnitNavNext !== undefined;
}

export interface UnitProperties {
  type: string;
  version: string;
  stateVariables: StateVariable[];
  pages: PageProperties[];
  enableSectionNumbering: boolean;
  sectionNumberingPosition: 'left' | 'above';
  showUnitNavNext: boolean;
}
