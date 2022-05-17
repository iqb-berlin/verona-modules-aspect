import { Section } from 'common/models/section';

export class Page {
  [index: string]: any;

  sections: Section[] = [];
  hasMaxWidth: boolean = false;
  maxWidth: number = 900;
  margin: number = 30;
  backgroundColor: string = '#ffffff';
  alwaysVisible: boolean = false;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom' = 'left';
  alwaysVisibleAspectRatio: number = 50;

  constructor(page?: Page) {
    this.sections = page?.sections.map(section => new Section(section)) || [new Section()];
    Object.assign(this, page);
  }
}
