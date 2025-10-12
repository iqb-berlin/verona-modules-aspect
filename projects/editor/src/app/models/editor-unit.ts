// eslint-disable-next-line max-classes-per-file
import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { Page, PageProperties } from 'common/models/page';
import { Section } from 'common/models/section';
import { AbstractIDService } from 'common/interfaces';

export class EditorUnit extends Unit {
  override pages: EditorPage[];

  constructor(unit?: UnitProperties, idService?: AbstractIDService) {
    super(unit, idService);
    this.pages = unit?.pages
      .map(page => new EditorPage(page, idService)) || [new EditorPage(undefined, idService)];
  }

  deleteElements(elements: UIElement[]): void {
    this.pages.forEach(page => page.deleteElements(elements));
  }
}

export class EditorPage extends Page {
  override sections: EditorSection[];

  constructor(page?: PageProperties, idService?: AbstractIDService) {
    super(page, idService);
    if (page?.sections !== undefined) {
      this.sections = page.sections.map(section => new EditorSection(section, idService));
    } else {
      this.sections = [new EditorSection(undefined, idService)];
    }
  }

  deleteElements(elements: UIElement[]): void {
    this.sections.forEach(section => section.deleteElements(elements));
  }
}

export class EditorSection extends Section {
  deleteElements(elements: UIElement[]): void {
    elements.forEach(element => {
      this.elements = this.elements.filter(el => el.id !== element.id);
    });
  }
}
