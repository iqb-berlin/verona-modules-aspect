import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { PositionedUIElement, UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { ArrayUtils } from 'common/util/array';
import { IDService } from 'editor/src/app/services/id.service';
import { VisibilityRule } from 'common/models/visibility-rule';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  unit = this.unitService.unit;

  constructor(private unitService: UnitService,
              private elementService: ElementService,
              private selectionService: SelectionService,
              private idService: IDService) { }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean | VisibilityRule[] | { value: number; unit: string }[]): void {
    section.setProperty(property, value);
    this.unitService.elementPropertyUpdated.next();
    this.unitService.updateUnitDefinition();
  }

  addSection(page: Page, section?: Section): void {
    // register section IDs
    if (section) {
      section.elements.forEach(element => {
        if (['drop-list', 'drop-list-simple'].includes((element as UIElement).type as string)) {
          (element as DropListElement).value.forEach(value => this.idService.addID(value.id));
        }
        if (['likert', 'cloze'].includes((element as UIElement).type as string)) {
          element.getChildElements().forEach(el => {
            this.idService.addID(el.id);
            if ((element as UIElement).type === 'drop-list') {
              (element as DropListElement).value.forEach(value => this.idService.addID(value.id));
            }
          });
        }
        this.idService.addID(element.id);
      });
    }
    page.sections.push(
      section || new Section()
    );
    this.unitService.updateUnitDefinition();
  }

  deleteSection(pageIndex: number, sectionIndex: number): void {
    this.unitService.unregisterIDs(this.unit.pages[pageIndex].sections[sectionIndex].getAllElements());
    this.unit.pages[pageIndex].sections.splice(sectionIndex, 1);
    this.unitService.updateUnitDefinition();
  }

  duplicateSection(section: Section, page: Page, sectionIndex: number): void {
    const newSection: Section = new Section({
      ...section,
      elements: section.elements.map(element => this.elementService.duplicateElement(element) as PositionedUIElement)
    });
    page.sections.splice(sectionIndex + 1, 0, newSection);
    this.unitService.updateUnitDefinition();
  }

  moveSection(section: Section, page: Page, direction: 'up' | 'down'): void {
    ArrayUtils.moveArrayItem(section, page.sections, direction);
    if (direction === 'up' && this.selectionService.selectedPageSectionIndex > 0) {
      this.selectionService.selectedPageSectionIndex -= 1;
    } else if (direction === 'down') {
      this.selectionService.selectedPageSectionIndex += 1;
    }
    this.unitService.updateUnitDefinition();
  }

  replaceSection(pageIndex: number, sectionIndex: number, newSection: Section): void {
    this.deleteSection(pageIndex, sectionIndex);
    this.addSection(this.unit.pages[pageIndex], newSection);
  }

  /* Move element between sections */
  transferElement(elements: UIElement[], previousSection: Section, newSection: Section): void {
    previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
    elements.forEach(element => {
      newSection.elements.push(element as PositionedUIElement);
    });
    this.unitService.updateUnitDefinition();
  }

  duplicateSelectedElements(): void {
    const selectedSection =
      this.unit.pages[this.selectionService.selectedPageIndex].sections[this.selectionService.selectedPageSectionIndex];
    this.selectionService.getSelectedElements().forEach((element: UIElement) => {
      selectedSection.elements.push(this.elementService.duplicateElement(element, true) as PositionedUIElement);
    });
    this.unitService.updateUnitDefinition();
  }
}
