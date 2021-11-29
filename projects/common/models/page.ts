import { Section } from './section';
import { moveArrayItem } from '../util/array';
import { UIElement } from './uI-element';
import { IdService } from '../id.service';

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

  /** Create new section with old section elements are overwrite the ids. */
  duplicateSection(section: Section, sectionIndex: number): void {
    const newSection = new Section(section);
    newSection.elements.forEach((element: UIElement) => {
      element.id = IdService.getInstance().getNewID(element.type);
    });
    this.sections.splice(sectionIndex + 1, 0, newSection);
  }

  moveSection(section: Section, direction: 'up' | 'down'): void {
    moveArrayItem(section, this.sections, direction);
  }
}
