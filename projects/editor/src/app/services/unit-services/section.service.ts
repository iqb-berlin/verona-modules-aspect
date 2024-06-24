import { Injectable } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { PositionedUIElement, UIElement, UIElementValue } from 'common/models/elements/element';
import { ArrayUtils } from 'common/util/array';
import { IDService } from 'editor/src/app/services/id.service';
import { VisibilityRule } from 'common/models/visibility-rule';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  constructor(private unitService: UnitService,
              private elementService: ElementService,
              private selectionService: SelectionService,
              private idService: IDService) { }

  updateSectionProperty(section: Section, property: string, value: string | number | boolean | VisibilityRule[] | { value: number; unit: string }[]): void {
    this.unitService.updateUnitDefinition({
      title: 'Abschnittseigenschaft geändert',
      command: () => {
        const oldValue = section[property];
        section.setProperty(property, value);
        if (property === 'ignoreNumbering') this.unitService.updateSectionCounter();
        this.unitService.elementPropertyUpdated.next();
        return {oldValue};
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
        const newSection = section;
        if (section) {
          this.unitService.registerIDs(section.elements);
        }
        page.addSection(section, sectionIndex);
        this.selectionService.selectedSectionIndex =
          Math.max(0, this.selectionService.selectedSectionIndex - 1);
        return {section, sectionIndex};
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
          return {deletedSection: sectionToDelete, pageIndex, sectionIndex};
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
      title: `Abschnitt dupliziert`,
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
      rollback: (deletedData: Record<string, unknown>) => {
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
      title: `Abschnitt verschoben`,
      command: () => {
        ArrayUtils.moveArrayItem(section, page.sections, direction);
        direction === 'up' ? this.selectionService.selectedSectionIndex -= 1 : this.selectionService.selectedSectionIndex += 1;
        this.unitService.updateSectionCounter();
        return {};
      },
      rollback: (deletedData: Record<string, unknown>) => {
        ArrayUtils.moveArrayItem(section, page.sections, direction === 'up' ? 'down' : 'up');
        direction === 'up' ? this.selectionService.selectedSectionIndex += 1 : this.selectionService.selectedSectionIndex -= 1;
        this.unitService.updateSectionCounter();
      }
    });
  }

  replaceSection(pageIndex: number, sectionIndex: number, newSection: Section): void {
    this.deleteSection(pageIndex, sectionIndex);
    this.addSection(this.unitService.unit.pages[pageIndex], newSection, sectionIndex);
  }

  /* Move element between sections */
  transferElements(elements: UIElement[], previousSection: Section, newSection: Section): void {
    this.unitService.updateUnitDefinition({
      title: `Element zwischen Abschnitten verschoben`,
      command: () => {
        previousSection.elements = previousSection.elements.filter(element => !elements.includes(element));
        elements.forEach(element => {
          newSection.elements.push(element as PositionedUIElement);
        });
        return {};
      },
      rollback: (deletedData: Record<string, unknown>) => {
        newSection.elements = newSection.elements.filter(element => !elements.includes(element));
        elements.forEach(element => {
          previousSection.elements.push(element as PositionedUIElement);
        });
      }
    });
  }
}
