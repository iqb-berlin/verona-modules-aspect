import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/util/section-counter';
import { ReferenceList, ReferenceManager } from 'editor/src/app/services/reference-manager';
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
              private idService: IDService) {
    this.unit = new Unit(undefined, this.idService);
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
      this.unit = new Unit(undefined, this.idService);
      this.referenceManager = new ReferenceManager(this.unit);
    }
  }

  private loadUnit(parsedUnitDefinition?: string): void {
    this.idService.reset();
    this.selectionService.reset();
    this.unit = new Unit(parsedUnitDefinition as unknown as UnitProperties, this.idService);
    this.referenceManager = new ReferenceManager(this.unit);

    const invalidRefs = this.referenceManager.getAllInvalidRefs();
    if (invalidRefs.length > 0) {
      this.referenceManager.removeInvalidRefs(invalidRefs);
      this.messageService.showFixedReferencePanel(invalidRefs);
      this.updateUnitDefinition();
    }
    // The unit constructor updated the version. Therefore the unit has changed and notifies the  host.
    if ((parsedUnitDefinition as unknown as UnitProperties).version !== VersionManager.getCurrentVersion()) {
      this.updateUnitDefinition();
    }
    this.updateSectionCounter();
  }

  updateUnitDefinition(): void {
    this.veronaApiService.sendChanged(
      UnitService.createUnitDefinition(this.unit),
      `${this.unit.type}@${this.unit.version}`,
      this.unit.getVariableInfos());
  }

  private static createUnitDefinition(unit: Unit): string {
    return JSON.stringify(unit, (key, value) => {
      if (key === 'idService') {
        return undefined;
      }
      return value;
    });
  }

  saveUnit(): void {
    FileService.saveUnitToFile(UnitService.createUnitDefinition(this.unit));
  }

  async loadUnitFromFile(): Promise<void> {
    const unitFile = await FileService.loadFile(['.json']);
    this.loadUnitDefinition(unitFile.content);
  }

  /* Used by props panel to show available dropLists to connect */
  getAllDropListElementIDs(): { id: string, alias: string }[] {
    const allDropLists = this.unit.getAllElements('drop-list');
    return allDropLists.map(dropList => ({ id: dropList.id, alias: dropList.alias }));
  }

  updateStateVariables(stateVariables: StateVariable[]): void {
    this.unit.stateVariables = stateVariables;
    this.updateUnitDefinition();
  }

  /* Check references and confirm */
  prepareDelete(deletedObjectType: 'page' | 'section' | 'elements',
                object: Page | Section | UIElement[],
                pageIndex?: number): Promise<boolean> {
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
          if (pageIndex === undefined) throw Error();
          dialogText = `Seite ${pageIndex + 1} löschen?`;
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
    this.updateUnitDefinition();
  }

  collapsePage(pageIndex: number): void {
    const sectionsToMove = this.unit.pages[pageIndex].sections;
    sectionsToMove.forEach(section => this.unit.pages[pageIndex - 1].addSection(section));
    this.selectionService.selectedPageIndex = pageIndex - 1;
    this.selectionService.selectedSectionIndex = this.unit.pages[pageIndex - 1].sections.length - sectionsToMove.length;
    this.unit.deletePage(pageIndex);
    this.updateUnitDefinition();
  }
}
