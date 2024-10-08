import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { PositionedUIElement, UIElement, UIElementValue } from 'common/models/elements/element';
import { ArrayUtils } from 'common/util/array';
import { VisibilityRule } from 'common/models/visibility-rule';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  constructor(private unitService: UnitService,
              private elementService: ElementService,
              private selectionService: SelectionService) { }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean | VisibilityRule[] | { value: number; unit: string }[]): void {
    this.unitService.updateUnitDefinition({
      title: 'Abschnittseigenschaft geändert',
      command: () => {
        const oldValue = section[property];
        section.setProperty(property, value);
        if (property === 'ignoreNumbering') this.unitService.updateSectionCounter();
        this.unitService.elementPropertyUpdated.next();
        return { oldValue };
      },
      rollback: (deletedData: Record<string, unknown>) => {
        section.setProperty(property, deletedData.oldValue as UIElementValue);
        this.unitService.elementPropertyUpdated.next();
      }
    });
  }

  addSection(page: Page, section?: Section, sectionIndex?: number): void {
    this.unitService.updateUnitDefinition({
      title: 'Abschnitt hinzugefügt',
      command: () => {
        if (section) this.unitService.registerIDs(section.elements);
        page.addSection(section, sectionIndex);
        this.selectionService.selectedSectionIndex =
          Math.max(0, this.selectionService.selectedSectionIndex - 1);
        this.unitService.updateSectionCounter();
        return { section, sectionIndex };
      },
      rollback: (deletedData: Record<string, unknown>) => {
        if (deletedData.section) {
          this.unitService.unregisterIDs((deletedData.section as Section).elements);
        }
        const sectionIndex: number = (deletedData.sectionIndex as number) !== undefined ?
          (deletedData.sectionIndex as number) :
          page.sections.length - 1;
        page.deleteSection(sectionIndex);
        this.selectionService.selectedSectionIndex =
          Math.max(0, this.selectionService.selectedSectionIndex - 1);
        this.unitService.updateSectionCounter();
      }
    });
  }

  deleteSection(pageIndex: number, sectionIndex: number): void {
    this.unitService.updateUnitDefinition({
      title: `Abschnitt gelöscht - Seite ${pageIndex + 1}, Abschnitt ${sectionIndex + 1}`,
      command: async () => {
        const sectionToDelete = this.unitService.unit.pages[pageIndex].sections[sectionIndex];
        if (await this.unitService.prepareDelete('section', sectionToDelete)) {
          this.unitService.unregisterIDs(sectionToDelete.getAllElements());
          this.unitService.unit.pages[pageIndex].sections.splice(sectionIndex, 1);
          this.selectionService.selectedSectionIndex =
            Math.max(0, this.selectionService.selectedSectionIndex - 1);
          this.unitService.updateSectionCounter();
          return { deletedSection: sectionToDelete, pageIndex, sectionIndex };
        }
        return {};
      },
      rollback: (deletedData: Record<string, unknown>) => {
        this.unitService.registerIDs((deletedData.deletedSection as Section).getAllElements());
        this.unitService.unit.pages[deletedData.pageIndex as number].addSection(deletedData.deletedSection as Section, sectionIndex);
        this.selectionService.selectedSectionIndex =
          Math.max(0, this.selectionService.selectedSectionIndex - 1);
        this.unitService.updateSectionCounter();
      }
    });
  }

  duplicateSection(section: Section, sectionIndex: number): void {
    const page = this.unitService.getSelectedPage();
    this.unitService.updateUnitDefinition({
      title: 'Abschnitt dupliziert',
      command: () => {
        const newSection: Section = new Section({
          ...section,
          elements: section.elements.map(element => this.elementService.duplicateElement(element) as PositionedUIElement)
        });
        page.addSection(newSection, sectionIndex + 1);
        this.selectionService.selectedSectionIndex += 1;
        this.unitService.updateSectionCounter();
        return {};
      },
      rollback: () => {
        this.unitService.unregisterIDs(page.sections[sectionIndex + 1].getAllElements());
        page.deleteSection(sectionIndex + 1);
        this.selectionService.selectedSectionIndex -= 1;
        this.unitService.updateSectionCounter();
      }
    });
  }

  moveSection(section: Section, direction: 'up' | 'down'): void {
    const page = this.unitService.getSelectedPage();
    this.unitService.updateUnitDefinition({
      title: 'Abschnitt verschoben',
      command: () => {
        ArrayUtils.moveArrayItem(section, page.sections, direction);
        direction === 'up' ? this.selectionService.selectedSectionIndex -= 1 :
          this.selectionService.selectedSectionIndex += 1;
        this.unitService.updateSectionCounter();
        return {};
      },
      rollback: () => {
        ArrayUtils.moveArrayItem(section, page.sections, direction === 'up' ? 'down' : 'up');
        direction === 'up' ? this.selectionService.selectedSectionIndex += 1 :
          this.selectionService.selectedSectionIndex -= 1;
        this.unitService.updateSectionCounter();
      }
    });
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

  replaceSection(pageIndex: number, sectionIndex: number, newSection: Section): void {
    const page = this.unitService.unit.pages[pageIndex];
    page.deleteSection(sectionIndex);
    page.addSection(newSection, sectionIndex);
    this.unitService.updateUnitDefinition();
    this.unitService.updateSectionCounter();
  }

  insertSection(pageIndex: number, sectionIndex: number, newSection: Section): void {
    const page = this.unitService.unit.pages[pageIndex];
    page.addSection(newSection, sectionIndex);
    this.unitService.updateUnitDefinition();
    this.unitService.updateSectionCounter();
  }

  /* Move element between sections */
  transferElements(elements: UIElement[], previousSection: Section, newSection: Section): void {
    this.unitService.updateUnitDefinition({
      title: 'Element zwischen Abschnitten verschoben',
      command: () => {
        previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
        elements.forEach(element => {
          newSection.elements.push(element as PositionedUIElement);
        });
        return {};
      },
      rollback: () => {
        newSection.elements = newSection.elements.filter(element => !elements.includes(element));
        elements.forEach(element => {
          previousSection.elements.push(element as PositionedUIElement);
        });
      }
    });
  }
}
