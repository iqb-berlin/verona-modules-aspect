import { Section } from './section';
import { moveArrayItem } from '../util/array';

export class Page {
  [index: string]: string | number | boolean | Section[] | undefined | ((...args: any) => any);
  sections: Section[] = [];
  hasMaxWidth: boolean = false;
  maxWidth: number = 900;
  margin: number = 30;
  backgroundColor: string = '#ffffff';
  alwaysVisible: boolean = false;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom' = 'left';
  alwaysVisibleAspectRatio: number = 50;

  constructor(serializedPage: Page = {} as Page) {
    Object.assign(this, serializedPage);
    this.sections = [];
    if (serializedPage.sections && serializedPage.sections.length > 0) {
      serializedPage?.sections.forEach((section: Section) => {
        this.sections.push(new Section(section));
      });
    } else {
      this.sections.push(new Section());
    }
  }

  appendSection(section: Section): void {
    this.sections.push(section);
  }

  addSection(): void {
    this.sections.push(new Section());
  }

  deleteSection(section: Section): void {
    this.sections.splice(
      this.sections.indexOf(section),
      1
    );
  }

  moveSection(section: Section, direction: 'up' | 'down'): void {
    moveArrayItem(section, this.sections, direction);
  }
}
