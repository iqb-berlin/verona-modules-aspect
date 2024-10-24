import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Unit, UnitProperties } from 'common/models/unit';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import {
  CompoundElement, UIElement
} from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/util/section-counter';
import { ReferenceList, ReferenceManager } from 'editor/src/app/services/reference-manager';
import { HistoryService, UnitUpdateCommand } from 'editor/src/app/services/history.service';
import { DialogService } from '../dialog.service';
import { VeronaAPIService } from '../verona-api.service';
import { SelectionService } from '../selection.service';
import { IDService } from '../id.service';
import { UnitDefinitionSanitizer } from '../sanitizer';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit;
  elementPropertyUpdated: Subject<void> = new Subject<void>();
  geometryElementPropertyUpdated: Subject<string> = new Subject<string>();
  mathTableElementPropertyUpdated: Subject<string> = new Subject<string>();
  tablePropUpdated: Subject<string> = new Subject<string>();
  sectionCountUpdated: Subject<void> = new Subject<void>();
  referenceManager: ReferenceManager;
  savedSectionCode: string | undefined;
  allowExpertMode: boolean = true;
  expertMode: boolean = true;

  constructor(private selectionService: SelectionService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private historyService: HistoryService,

              private idService: IDService) {
    this.unit = new Unit();
    this.referenceManager = new ReferenceManager(this.unit);
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      try {
        let unitDef = JSON.parse(unitDefinition);
        if (!VersionManager.hasCompatibleVersion(unitDef)) {
          if (VersionManager.isNewer(unitDef)) {
            throw Error('Unit-Version ist neuer als dieser Editor. Bitte mit der neuesten Version öffnen.');
          }
          if (!VersionManager.needsSanitization(unitDef)) {
            throw Error('Unit-Version ist veraltet. Sie kann mit Version 1.38/1.39 aktualisiert werden.');
          }
          this.dialogService.showSanitizationDialog().subscribe(() => {
            unitDef = UnitDefinitionSanitizer.sanitizeUnit(unitDef);
            this.loadUnit(unitDef);
            this.updateUnitDefinition();
          });
        } else {
          this.loadUnit(unitDef);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (e instanceof Error) this.dialogService.showUnitDefErrorDialog(e.message);
      }
    } else {
      this.idService.reset();
      this.unit = new Unit();
      this.referenceManager = new ReferenceManager(this.unit);
    }
  }

  private loadUnit(parsedUnitDefinition?: string): void {
    this.selectionService.reset();
    this.idService.reset();
    this.unit = new Unit(parsedUnitDefinition as unknown as UnitProperties);
    this.idService.registerUnitIds(this.unit);
    this.referenceManager = new ReferenceManager(this.unit);

    const invalidRefs = this.referenceManager.getAllInvalidRefs();
    if (invalidRefs.length > 0) {
      this.referenceManager.removeInvalidRefs(invalidRefs);
      this.messageService.showFixedReferencePanel(invalidRefs);
      this.updateUnitDefinition();
    }
    this.updateSectionCounter();
  }

  async updateUnitDefinition(command?: UnitUpdateCommand): Promise<void> {
    if (command) {
      const deletedData = await command.command();
      if (deletedData instanceof Promise) {
        deletedData.then((deletedData) => {
          this.historyService.addCommand(command, deletedData);
        });
      } else {
        this.historyService.addCommand(command, deletedData);
      }
    }
    this.veronaApiService.sendChanged(this.unit);
  }

  rollback(): void {
    this.historyService.rollback();
    this.veronaApiService.sendChanged(this.unit);
  }

  registerIDs(elements: UIElement[]): void {
    elements.forEach(element => {
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

  unregisterIDs(elements: UIElement[]): void {
    elements.forEach(element => {
      if (element.type === 'drop-list') {
        ((element as DropListElement).value as DragNDropValueObject[]).forEach((value: DragNDropValueObject) => {
          this.idService.unregisterID(value.id);
        });
      }
      if (element instanceof CompoundElement) {
        element.getChildElements().forEach((childElement: UIElement) => {
          this.idService.unregisterID(childElement.id);
        });
      }
      this.idService.unregisterID(element.id);
    });
  }

  saveUnit(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
  }

  async loadUnitFromFile(): Promise<void> {
    const unitFile = await FileService.loadFile(['.json']);
    this.loadUnitDefinition(unitFile.content);
  }

  getNewValueID(): string {
    return this.idService.getAndRegisterNewID('value');
  }

  /* Used by props panel to show available dropLists to connect */
  getAllDropListElementIDs(): string[] {
    const allDropLists = [
      ...this.unit.getAllElements('drop-list'),
      ...this.unit.getAllElements('drop-list-simple')];
    return allDropLists.map(dropList => dropList.id);
  }

  updateStateVariables(stateVariables: StateVariable[]): void {
    this.unit.stateVariables = stateVariables;
    this.updateUnitDefinition();
  }

  /* Check references and confirm */
  prepareDelete(deletedObjectType: 'page' | 'section' | 'elements', object: Page | Section | UIElement[]): Promise<boolean> {
    return new Promise((resolve) => {
      let refs: ReferenceList[] = [];
      let dialogText: string = '';
      switch (deletedObjectType) {
        case 'page':
          refs = this.referenceManager.getPageElementsReferences(
            this.unit.pages[this.selectionService.selectedPageIndex]
          );
          const pageNavButtonRefs = this.referenceManager.getButtonReferencesForPage(
            this.selectionService.selectedPageIndex
          );
          refs = refs.concat(pageNavButtonRefs);
          dialogText = `Seite ${this.selectionService.selectedPageIndex + 1} löschen?`;
          break;
        case 'section':
          refs = this.referenceManager.getSectionElementsReferences([object as Section]);
          dialogText = `Abschnitt ${this.selectionService.selectedSectionIndex + 1} löschen?`;
          break;
        case 'elements':
          refs = this.referenceManager.getElementsReferences(object as UIElement[]);
          dialogText = 'Folgende Elemente werden gelöscht:';
      }

      this.dialogService.showDeleteConfirmDialog(
        dialogText,
        deletedObjectType === 'elements' ? object as UIElement[] : undefined,
        refs)
        .subscribe((result: boolean) => {
          if (result) {
            if (refs.length > 0) ReferenceManager.deleteReferences(refs); // TODO rollback?
            resolve(true);
          } else {
            if (refs.length > 0) this.messageService.showReferencePanel(refs);
            resolve(false);
          }
        });
    });
  }

  updateSectionCounter(): void {
    SectionCounter.reset();
    // Wait for the change to propagate through the components
    setTimeout(() => this.sectionCountUpdated.next());
  }

  setSectionNumbering(isEnabled: boolean) {
    this.unit.enableSectionNumbering = isEnabled;
    this.updateUnitDefinition();
    this.updateSectionCounter();
  }

  setSectionNumberingPosition(position: 'above' | 'left') {
    this.unit.sectionNumberingPosition = position;
    this.updateUnitDefinition();
    this.updateSectionCounter();
  }

  setUnitNavNext(isEnabled: boolean) {
    this.unit.showUnitNavNext = isEnabled;
    this.updateUnitDefinition();
  }

  getSelectedPage() {
    return this.unit.pages[this.selectionService.selectedPageIndex];
  }

  getSelectedSection() {
    return this.unit.pages[this.selectionService.selectedPageIndex]
      .sections[this.selectionService.selectedSectionIndex];
  }

  setSectionExpertMode(checked: boolean) {
    this.expertMode = checked;
  }

  /* May remove existing connections! */
  connectAllDropLists(sectionParam?: Section) {
    const section: Section = sectionParam || this.getSelectedSection();
    const dropLists: DropListElement[] = section.getAllElements('drop-list') as DropListElement[];
    const dropListIDs = dropLists.map(list => list.id);
    dropLists.forEach(dropList => {
      dropList.connectedTo = [...dropListIDs];
      dropList.connectedTo.splice(dropListIDs.indexOf(dropList.id), 1);
    });
  }

  moveSectionToNewpage(pageIndex: number, sectionIndex: number): void {
    const sectionsLength = this.unit.pages[pageIndex].sections.length;
    const sectionsToMove = this.unit.pages[pageIndex].sections
      .splice(sectionIndex, sectionsLength - sectionIndex);

    const newPage = new Page();
    sectionsToMove.forEach(section => newPage.addSection(section));
    newPage.deleteSection(0);

    this.unit.pages.splice(pageIndex + 1, 0, newPage);
    this.selectionService.selectedPageIndex = pageIndex + 1;
    this.selectionService.selectedSectionIndex = 0;
  }

  collapsePage(pageIndex: number): void {
    const sectionsToMove = this.unit.pages[pageIndex].sections;
    sectionsToMove.forEach(section => this.unit.pages[pageIndex - 1].addSection(section));
    this.selectionService.selectedPageIndex = pageIndex - 1;
    this.selectionService.selectedSectionIndex = this.unit.pages[pageIndex - 1].sections.length - sectionsToMove.length;
    this.unit.deletePage(pageIndex);
  }
}
