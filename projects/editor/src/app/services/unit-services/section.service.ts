import { Injectable } from '@angular/core';
import { PositionedUIElement, UIElementValue } from 'common/interfaces';
import { UIElement } from 'common/models/elements/element';
import { ArrayUtils } from 'common/util/array';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { EditorPage, EditorSection } from 'editor/src/app/models/editor-unit';

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

  addSection(page: EditorPage, section?: EditorSection, sectionIndex?: number): void {
    if (section) section.getAllElements().forEach(el => el.registerIDs());
    page.addSection(section, sectionIndex);
    this.selectionService.selectedSectionIndex =
      Math.max(0, this.selectionService.selectedSectionIndex - 1);
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  async deleteSection(pageIndex: number, sectionIndex: number): Promise<void> {
    const sectionToDelete = this.unitService.unit.pages[pageIndex].sections[sectionIndex];
    if (await this.unitService.prepareDelete('section', sectionToDelete)) {
      sectionToDelete.getAllElements().forEach(el => el.unregisterIDs());
      this.unitService.unit.pages[pageIndex].sections.splice(sectionIndex, 1);
      this.selectionService.selectedSectionIndex =
        Math.max(0, this.selectionService.selectedSectionIndex - 1);
      this.unitService.updateSectionCounter();
    }
    this.unitService.updateUnitDefinition();
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

  replaceSection(pageIndex: number, sectionIndex: number, newSection: EditorSection): void {
    const page = this.unitService.unit.pages[pageIndex];
    page.deleteSection(sectionIndex);
    page.addSection(newSection, sectionIndex);
    this.unitService.updateUnitDefinition();
    this.unitService.updateSectionCounter();
  }

  insertSection(pageIndex: number, sectionIndex: number, newSection: EditorSection): void {
    const page = this.unitService.unit.pages[pageIndex];
    page.addSection(newSection, sectionIndex);
    this.unitService.updateUnitDefinition();
    this.unitService.updateSectionCounter();
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
