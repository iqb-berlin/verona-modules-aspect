import { UIElement } from 'common/models/elements/element';
import { Page, PageProperties } from 'common/models/page';
import { AbstractIDService } from 'common/models/id-interfaces';
import { EditorSection } from 'editor/src/app/models/editor-section';

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
      this.sections.push(section || new EditorSection(undefined, this.idService));
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
