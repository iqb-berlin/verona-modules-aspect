import { Section } from 'common/models/section';
import { UIElement } from 'common/models/elements/element';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

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

  constructor(page?: PageProperties) {
    if (page && isValid(page)) {
      this.hasMaxWidth = page.hasMaxWidth;
      this.maxWidth = page.maxWidth;
      this.margin = page.margin;
      this.backgroundColor = page.backgroundColor;
      this.alwaysVisible = page.alwaysVisible;
      this.alwaysVisiblePagePosition = page.alwaysVisiblePagePosition;
      this.alwaysVisibleAspectRatio = page.alwaysVisibleAspectRatio;
      this.sections = page.sections.map(section => new Section(section));
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
      this.sections = page?.sections.map(section => new Section(section)) || [new Section()];
    }
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.sections.map(section => section.getAllElements(elementType)).flat();
  }

  getAnswerScheme(dropLists: UIElement[]): AnswerScheme[] {
    return this.sections.map(section => section.getAnswerScheme(dropLists)).flat();
  }
}

export interface PageProperties {
  sections: Section[];
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
