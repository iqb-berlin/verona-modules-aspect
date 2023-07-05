import { Section } from 'common/models/section';
import { UIElement } from 'common/models/elements/element';
import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';

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

  constructor(page: PageProperties) {
    this.hasMaxWidth = page.hasMaxWidth;
    this.maxWidth = page.maxWidth;
    this.margin = page.margin;
    this.backgroundColor = page.backgroundColor;
    this.alwaysVisible = page.alwaysVisible;
    this.alwaysVisiblePagePosition = page.alwaysVisiblePagePosition;
    this.alwaysVisibleAspectRatio = page.alwaysVisibleAspectRatio;
    this.sections = page.sections.map(section => new Section(section));
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
