import { Section, SectionProperties } from 'common/models/section';
import { UIElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import { environment } from 'common/environment';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { AbstractIDService } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class Page {
  [index: string]: unknown;
  sections: Section[] = [];
  hasMaxWidth: boolean = true;
  maxWidth: number = 750;
  margin: number = 30;
  backgroundColor: string = '#ffffff';
  alwaysVisible: boolean = false;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom' = 'left';
  alwaysVisibleAspectRatio: number = 50;

  idService?: AbstractIDService;

  constructor(page?: PageProperties, idService?: AbstractIDService) {
    this.idService = idService;
    if (page && isValid(page)) {
      this.hasMaxWidth = page.hasMaxWidth;
      this.maxWidth = page.maxWidth;
      this.margin = page.margin;
      this.backgroundColor = page.backgroundColor;
      this.alwaysVisible = page.alwaysVisible;
      this.alwaysVisiblePagePosition = page.alwaysVisiblePagePosition;
      this.alwaysVisibleAspectRatio = page.alwaysVisibleAspectRatio;
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Page instantiation');
      }
      if (page?.hasMaxWidth !== undefined) this.hasMaxWidth = page.hasMaxWidth;
      if (page?.maxWidth !== undefined) this.maxWidth = page.maxWidth;
      if (page?.margin !== undefined) this.margin = page.margin;
      if (page?.backgroundColor !== undefined) this.backgroundColor = page.backgroundColor;
      if (page?.alwaysVisible !== undefined) this.alwaysVisible = page.alwaysVisible;
      if (page?.alwaysVisiblePagePosition !== undefined) this.alwaysVisiblePagePosition = page.alwaysVisiblePagePosition;
      if (page?.alwaysVisibleAspectRatio !== undefined) this.alwaysVisibleAspectRatio = page.alwaysVisibleAspectRatio;
    }
    this.sections = this.createSections(page, idService);
  }

  // eslint-disable-next-line class-methods-use-this
  protected createSections(page?: PageProperties, idService?: AbstractIDService): Section[] {
    if (page?.sections !== undefined) {
      return page.sections.map(section => new Section(section, idService));
    }
    return [new Section(undefined, idService)];
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.sections.map(section => section.getAllElements(elementType)).flat();
  }

  getVariableInfos(dropLists: DropListElement[]): VariableInfo[] {
    return this.sections.map(section => section.getVariableInfos(dropLists)).flat();
  }

  addSection(section?: Section, sectionIndex?: number): void {
    if (sectionIndex !== undefined) {
      this.sections.splice(sectionIndex, 0, section || new Section(undefined, this.idService));
    } else {
      this.sections.push(section || new Section());
    }
  }

  replaceSection(sectionIndex: number, section: Section): void {
    this.sections.splice(sectionIndex, 1, section);
  }

  deleteSection(sectionIndex: number): Section {
    return this.sections.splice(sectionIndex, 1)[0];
  }

  duplicateSection(sectionIndex: number): void {
    const newSection = this.sections[sectionIndex].getDuplicate();
    this.addSection(newSection, sectionIndex + 1);
  }
}

export interface PageProperties {
  sections: SectionProperties[];
  hasMaxWidth: boolean;
  maxWidth: number;
  margin: number;
  backgroundColor: string;
  alwaysVisible: boolean;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom';
  alwaysVisibleAspectRatio: number;
}

function isValid(blueprint?: PageProperties): boolean {
  if (!blueprint) return false;
  return blueprint.sections !== undefined &&
    blueprint.hasMaxWidth !== undefined &&
    blueprint.maxWidth !== undefined &&
    blueprint.margin !== undefined &&
    blueprint.backgroundColor !== undefined &&
    blueprint.alwaysVisible !== undefined &&
    blueprint.alwaysVisiblePagePosition !== undefined &&
    blueprint.alwaysVisibleAspectRatio !== undefined;
}
