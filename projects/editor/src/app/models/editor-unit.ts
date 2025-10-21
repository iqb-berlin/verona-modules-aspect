// eslint-disable-next-line max-classes-per-file
import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { Page, PageProperties } from 'common/models/page';
import { Section } from 'common/models/section';
import { AbstractIDService } from 'common/interfaces';

export class EditorUnit extends Unit {
  override pages!: EditorPage[];

  // eslint-disable-next-line class-methods-use-this
  protected override createPages(unit?: UnitProperties, idService?: AbstractIDService): EditorPage[] {
    return unit?.pages.map(page => new EditorPage(page, idService)) ||
        [new EditorPage(undefined, idService)];
  }

  deleteElements(elements: UIElement[]): void {
    this.pages.forEach(page => page.deleteElements(elements));
  }
}

export class EditorPage extends Page {
  override sections!: EditorSection[];

  // eslint-disable-next-line class-methods-use-this
  protected override createSections(page?: PageProperties, idService?: AbstractIDService): EditorSection[] {
    if (page?.sections !== undefined) {
      return page.sections.map(section => new EditorSection(section, idService));
    }
    return [new EditorSection(undefined, idService)];
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
