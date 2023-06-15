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

  constructor(page?: Record<string, any>) {
    if (page?.hasMaxWidth) this.hasMaxWidth = page.hasMaxWidth;
    if (page?.maxWidth) this.maxWidth = page.maxWidth;
    if (page?.margin !== undefined) this.margin = page.margin;
    if (page?.backgroundColor) this.backgroundColor = page.backgroundColor;
    if (page?.alwaysVisible) this.alwaysVisible = page.alwaysVisible;
    if (page?.alwaysVisiblePagePosition) this.alwaysVisiblePagePosition = page.alwaysVisiblePagePosition;
    if (page?.alwaysVisibleAspectRatio) this.alwaysVisibleAspectRatio = page.alwaysVisibleAspectRatio;
    this.sections = page?.sections?.map((section: Record<string, any>) => new Section(section)) || [new Section()];
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.sections.map(section => section.getAllElements(elementType)).flat();
  }

  getAnswerScheme(dropLists: UIElement[]): AnswerScheme[] {
    return this.sections.map(section => section.getAnswerScheme(dropLists)).flat();
  }
}
