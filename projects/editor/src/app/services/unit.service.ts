import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { VariableInfo } from '@iqb/responses';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/utils/section-counter';
import { VariableAlias } from 'common/utils/variable-alias';
import { ReferenceList, ReferenceManager } from 'editor/src/app/classes/reference-manager';
import { MigrationManager } from 'common/services/migration-manager';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { VeronaAPIService } from 'editor/src/app/services/verona-api.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: EditorUnit;
  elementPropertyUpdated: Subject<void> = new Subject<void>();
  geometryElementPropertyUpdated: Subject<string> = new Subject<string>();
  mathTableElementPropertyUpdated: Subject<string> = new Subject<string>();
  tablePropUpdated: Subject<string> = new Subject<string>();
  sectionCountUpdated: Subject<void> = new Subject<void>();
  pageOrderChanged: Subject<void> = new Subject<void>();
  referenceManager: ReferenceManager;
  savedSectionCode: string | undefined;
  allowExpertMode: boolean = true;
  expertMode: boolean = true;
  /* A pending sanitization dialog holds the definition of the load that opened it. Every further load
     supersedes it: confirming it later would replace the unit that is loaded by then and report the
     older one to the host under the newer session. Announcing the newer load is all this side has to
     do -- the dialog is then closed and its result no longer reaches the callback below (#1247). */
  private loadSuperseded = new Subject<void>();
  /* Fires once `unit` has actually been swapped. The load above announces its own start, which is what
     a dialog belonging to that load needs; a dialog belonging to the unit -- a delete waiting for its
     confirmation -- has to know when the unit under it is gone, which a load that ends in an error or
     in the sanitization dialog never does (#1253). */
  private unitReplaced = new Subject<void>();

  constructor(private selectionService: SelectionService,
              private veronaApiService: VeronaAPIService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private idService: IDService,
              private translateService: TranslateService) {
    this.unit = new EditorUnit(undefined, this.idService);
    this.referenceManager = new ReferenceManager(this.unit);
  }

  loadUnitDefinition(unitDefinition: string): void {
    this.loadSuperseded.next();
    if (unitDefinition) {
      try {
        let unitDef = JSON.parse(unitDefinition);
        if (!VersionManager.hasCompatibleVersion(unitDef)) {
          if (VersionManager.isNewer(unitDef)) {
            throw Error('Unit-Version ist neuer als dieser Editor. Bitte mit der neuesten Version öffnen.');
          }
          if (!VersionManager.needsMigration(unitDef)) {
            throw Error('Unit-Version ist veraltet. Sie kann mit Version 1.38/1.39 aktualisiert werden.');
          }
          this.dialogService.showSanitizationDialog(this.loadSuperseded).subscribe(() => {
            unitDef = MigrationManager.migrate(unitDef, VersionManager.getCurrentVersion());
            this.loadUnit(unitDef);
            this.updateUnitDefinition();
          });
        } else {
          if (VersionManager.needsMigration(unitDef)) {
            unitDef = MigrationManager.migrate(unitDef, VersionManager.getCurrentVersion());
          }
          this.loadUnit(unitDef);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (e instanceof Error) this.dialogService.showUnitDefErrorDialog(e.message);
      }
    } else {
      /* The host replays the stored definition on every load, and for a unit that was never saved
       * with content it is empty -- discarding such a unit lands here (#1089). Swapping `unit` alone
       * left the selection pointing into the unit that just went away: with the second section
       * selected, the properties panel read `sections[1]` of the fresh single-section unit, and the
       * dialog the ErrorHandler opens runs change detection straight back into the same throw.
       * This is also the one load path on which a stale selection survives: an empty unit renders no
       * element overlay, so nothing re-selects and papers over it the way it does after loadUnit.
       * Of what loadUnit does beyond these resets, nothing fits here. An empty unit has no references
       * to repair and no variable infos to validate, and reRegisterAll would find neither a state
       * variable nor an element to register. updateUnitDefinition is left out on purpose: it reports
       * the unit to the host as changed, and a discard must not hand back a fresh change at once. */
      this.idService.reset();
      this.selectionService.reset();
      this.unit = new EditorUnit(undefined, this.idService);
      this.referenceManager = new ReferenceManager(this.unit);
      this.updateSectionCounter();
      this.unitReplaced.next();
    }
  }

  private loadUnit(parsedUnitDefinition?: string): void {
    this.idService.reset();
    this.selectionService.reset();
    this.unit = new EditorUnit(parsedUnitDefinition as unknown as UnitProperties, this.idService);
    this.reRegisterAll();
    this.referenceManager = new ReferenceManager(this.unit);
    /* As early as the unit and its reference manager are in place: everything below can throw into the
       error dialog of loadUnitDefinition, and the unit would be replaced all the same. */
    this.unitReplaced.next();

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
    this.checkForInvalidVariableInfos();
  }

  /* Invalid ids/aliases can come in via imported unit definitions. They are not reported
     to the host (see getValidVariableInfos), therefore the user gets notified. (#1043) */
  private checkForInvalidVariableInfos(): void {
    const invalidVariableInfos = this.unit.getVariableInfos()
      .filter(variableInfo => !UnitService.isReportableVariableInfo(variableInfo));
    if (invalidVariableInfos.length > 0) {
      this.messageService.showPrompt(
        this.translateService.instant(
          'invalidVariableAliases',
          { aliases: invalidVariableInfos.map(v => v.alias ?? v.id).join(', ') }));
    }
  }

  updateUnitDefinition(): void {
    this.veronaApiService.sendChanged(
      UnitService.createUnitDefinition(this.unit),
      `${this.unit.type}@${this.unit.version}`,
      this.getValidVariableInfos());
  }

  private getValidVariableInfos(): VariableInfo[] {
    return this.unit.getVariableInfos()
      .filter(variableInfo => UnitService.isReportableVariableInfo(variableInfo));
  }

  private static isReportableVariableInfo(variableInfo: VariableInfo): boolean {
    return VariableAlias.isValid(variableInfo.id) &&
      (variableInfo.alias === undefined || VariableAlias.isValid(variableInfo.alias));
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

  /* Used by props panel to show available dropLists to connect */
  getAllDropListElementIDs(): { id: string, alias: string }[] {
    const allDropLists = this.unit.getAllElements('drop-list');
    return allDropLists.map(dropList => ({ id: dropList.id, alias: dropList.alias }));
  }

  updateStateVariables(stateVariables: StateVariable[]): void {
    this.unit.stateVariables = stateVariables;
    this.reRegisterAll();
    this.updateUnitDefinition();
  }

  reRegisterAll(): void {
    this.idService.reset();
    this.unit.stateVariables.forEach(v => {
      this.idService.register(v.id, true, false);
      this.idService.register(v.alias, false, true);
    });
    this.unit.getAllElements().forEach(el => el.registerIDs());
  }

  /* Check references and confirm */
  prepareDelete(deletedObjectType: 'page' | 'section' | 'elements',
                object: EditorPage | Section | UIElement[],
                pageIndex?: number): Promise<boolean> {
    return new Promise(resolve => {
      const unitAtRequest = this.unit;
      let refs: ReferenceList[] = [];
      let dialogText: string = '';
      switch (deletedObjectType) {
        case 'page': {
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
        }
        case 'section':
          refs = this.referenceManager.getSectionElementsReferences([object as Section]);
          dialogText = `Abschnitt ${this.selectionService.selectedSectionIndex + 1} löschen?`;
          break;
        case 'elements':
          refs = this.referenceManager.getElementsReferences(object as UIElement[]);
          dialogText = 'Folgende Elemente werden gelöscht:';
          break;
        default:
          throw Error('Unknown object type');
      }

      this.dialogService.showDeleteConfirmDialog(
        dialogText,
        this.unitReplaced,
        deletedObjectType === 'elements' ? object as UIElement[] : undefined,
        refs)
        .subscribe(result => {
          /* Everything gathered above -- the object, the refs, and the index the caller kept -- belongs
             to the unit as it was when the dialog opened. Once that unit is gone, deleting would hit
             the same position in the newly loaded one, and reporting the refs would name elements the
             user cannot see; so this leaves both alone (#1253). */
          if (this.unit !== unitAtRequest) {
            resolve(false);
            return;
          }
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

  /* Only a section this page holds, and not its first one, can start a new page. Both ends leave a page
     without sections, by different routes: an index the page does not hold splices out an empty list,
     `deleteSection(0)` takes the new page's own default section away, and the selection below lands on
     the empty new page; index 0 moves every section, so the page this breaks stays behind with none.
     Either way the properties panel reads `sections[0]` and throws (#1089), which #1202 turns into an
     endless row of dialogs.

     This guards the structure, not the page: an index that exists here passes, whether or not it is the
     one the user chose. That the chosen section is one of THIS page's is what the button decides, which
     is disabled for a selection on another page (#1203). */
  moveSectionToNewpage(pageIndex: number, sectionIndex: number): void {
    const sectionsLength = this.unit.pages[pageIndex].sections.length;
    if (sectionIndex <= 0 || sectionIndex >= sectionsLength) return;
    const sectionsToMove = this.unit.pages[pageIndex].sections
      .splice(sectionIndex, sectionsLength - sectionIndex);

    const newPage = new EditorPage();
    sectionsToMove.forEach(section => newPage.addSection(section));
    newPage.deleteSection(0);

    this.unit.pages.splice(pageIndex + 1, 0, newPage);
    this.selectionService.selectedPageIndex = pageIndex + 1;
    this.selectionService.selectedSectionIndex = 0;
    this.updateUnitDefinition();
  }

  /* There has to be a regular page before this one to hand the sections to: page 0 has none at all, and
     a permanently visible page is not a page they may land on -- they would be shown alongside every
     other page from then on, and this page, which held them, is deleted below. The button is locked for
     both cases (#1298); this guards it where the pages are actually written, as `moveSectionToNewpage`
     does next door (#1203). */
  collapsePage(pageIndex: number): void {
    if (pageIndex <= 0 || this.unit.pages[pageIndex - 1].alwaysVisible) return;
    const sectionsToMove = this.unit.pages[pageIndex].sections;
    sectionsToMove.forEach(section => this.unit.pages[pageIndex - 1].addSection(section));
    this.selectionService.selectedPageIndex = pageIndex - 1;
    this.selectionService.selectedSectionIndex = this.unit.pages[pageIndex - 1].sections.length - sectionsToMove.length;
    this.unit.deletePage(pageIndex);
    this.updateUnitDefinition();
  }
}
