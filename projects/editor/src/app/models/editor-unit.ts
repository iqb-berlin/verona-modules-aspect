// eslint-disable-next-line max-classes-per-file
import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { Page, PageProperties } from 'common/models/page';
import { Section } from 'common/models/section';
import { AbstractIDService } from 'common/interfaces';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

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

  addSection(section?: EditorSection, sectionIndex?: number): void {
    if (sectionIndex !== undefined) {
      this.sections.splice(sectionIndex, 0, section || new EditorSection(undefined, this.idService));
    } else {
      this.sections.push(section || new EditorSection());
    }
  }

  replaceSection(sectionIndex: number, section: EditorSection): void {
    this.sections.splice(sectionIndex, 1, section);
  }

  deleteSection(sectionIndex: number): EditorSection {
    return this.sections.splice(sectionIndex, 1)[0];
  }

  duplicateSection(sectionIndex: number): void {
    const newSection = this.sections[sectionIndex].getDuplicate();
    this.addSection(newSection, sectionIndex + 1);
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

  getDuplicate(): EditorSection {
    return new EditorSection({
      ...this,
      elements: this.elements.map(el => el.getBlueprint())
    }, this.idService);
  }

  /* May remove existing connections! */
  connectAllDropLists(): void {
    const dropLists: DropListElement[] = this.getAllElements('drop-list') as DropListElement[];
    const dropListIDs = dropLists.map(list => list.id);
    dropLists.forEach(dropList => {
      dropList.connectedTo = [...dropListIDs];
      // remove self
      dropList.connectedTo.splice(dropListIDs.indexOf(dropList.id), 1);
    });
  }
}
