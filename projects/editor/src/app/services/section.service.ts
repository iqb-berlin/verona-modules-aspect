import { Injectable } from '@angular/core';
import { PositionedUIElement, UIElementValue } from 'common/models/ui-element-interfaces';
import { UIElement } from 'common/models/elements/element';
import { ArrayUtils } from 'common/utils/array-utils';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorSection } from 'editor/src/app/models/editor-section';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  constructor(private unitService: UnitService,
              private elementService: ElementService,
              private selectionService: SelectionService) { }

  updateSectionProperty(section: EditorSection, property: string, value: UIElementValue): void {
    section.setProperty(property, value);
    if (property === 'ignoreNumbering') this.unitService.updateSectionCounter();
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  /* Where the section lands is up to the page the caller passes, and a selection needs the page as much
     as the index -- so the callers set it: insertSection and replaceSection to the section they put in,
     PageViewComponent to the one it appended (#1255). */
  addSection(page: EditorPage, section?: EditorSection, sectionIndex?: number): void {
    if (section) section.getAllElements().forEach(el => el.registerIDs());
    page.addSection(section, sectionIndex);
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  /* Reports whether the section is gone, which is what replaceSection hangs its insertion on. */
  async deleteSection(pageIndex: number, sectionIndex: number): Promise<boolean> {
    const sectionToDelete = this.unitService.unit.pages[pageIndex].sections[sectionIndex];
    if (!await this.unitService.prepareDelete('section', sectionToDelete)) return false;
    sectionToDelete.getAllElements().forEach(el => el.unregisterIDs());
    this.unitService.unit.pages[pageIndex].sections.splice(sectionIndex, 1);
    this.selectionService.selectedSectionIndex =
      Math.max(0, this.selectionService.selectedSectionIndex - 1);
    this.unitService.updateSectionCounter();
    /* Inside the branch, as in deletePage and deleteElements: what the host is told about is a
       deletion, and there is none when the user cancels or when the unit was replaced under the
       dialog (#1253). */
    this.unitService.updateUnitDefinition();
    return true;
  }

  duplicateSection(sectionIndex: number): void {
    const page = this.unitService.getSelectedPage();
    page.duplicateSection(sectionIndex);
    this.selectionService.selectedSectionIndex += 1;
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  moveSection(section: EditorSection, direction: 'up' | 'down'): void {
    const page = this.unitService.getSelectedPage();
    ArrayUtils.moveArrayItem(section, page.sections, direction);
    direction === 'up' ? this.selectionService.selectedSectionIndex -= 1 :
      this.selectionService.selectedSectionIndex += 1;
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  /* Move section (up and down) from one page to another */
  transferSection(pageIndex: number, sectionIndex: number, direction: 'up' | 'down'): void {
    const section = this.unitService.unit.pages[pageIndex].deleteSection(sectionIndex);
    if (direction === 'up') {
      this.unitService.unit.pages[pageIndex - 1].addSection(section);
      this.selectionService.selectedPageIndex = pageIndex - 1;
      this.selectionService.selectedSectionIndex = this.unitService.unit.pages[pageIndex - 1].sections.length - 1;
    } else {
      this.unitService.unit.pages[pageIndex + 1].addSection(section, 0);
      this.selectionService.selectedPageIndex = pageIndex + 1;
      this.selectionService.selectedSectionIndex = 0;
    }
    // Prevent empty Page
    if (this.unitService.unit.pages[pageIndex].sections.length === 0) {
      this.unitService.unit.pages[pageIndex].addSection();
    }
  }

  /* Replacing is the deletion plus the insertion, so the insertion waits for the deletion to happen:
     the page is read afterwards, and a delete the user declined -- or one whose unit the host replaced
     while the dialog was open -- leaves the section it was about in place and inserts nothing (#1253). */
  async replaceSection(pageIndex: number, sectionIndex: number, newSection: EditorSection): Promise<void> {
    if (await this.deleteSection(pageIndex, sectionIndex)) {
      this.addSection(this.unitService.unit.pages[pageIndex], newSection, sectionIndex);
      this.selectionService.updateSelection(pageIndex, sectionIndex);
    }
  }

  insertSection(pageIndex: number, sectionIndex: number, newSection: EditorSection): void {
    const page = this.unitService.unit.pages[pageIndex];
    this.addSection(page, newSection, sectionIndex);
    this.selectionService.updateSelection(pageIndex, sectionIndex);
  }

  /* Move element between sections */
  transferElements(elements: UIElement[], previousSection: EditorSection, newSection: EditorSection): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => {
      newSection.elements.push(element as PositionedUIElement);
    });
    this.unitService.updateUnitDefinition();
  }
}
