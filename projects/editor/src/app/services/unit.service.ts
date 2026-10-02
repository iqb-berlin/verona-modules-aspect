import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Unit, UnitProperties } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { Section } from 'common/models/section';
import { Page } from 'common/models/page';
import { SectionCounter } from 'common/utils/section-counter';
import { ReferenceHolder, ReferenceList, ReferenceManager } from 'editor/src/app/classes/reference-manager';
import { MigrationManager } from 'common/services/migration-manager';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { VeronaAPIService } from 'editor/src/app/services/verona-api.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import { VariableInfoOrigin, VariableInfoOrigins } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssue, VariableInfoValidator } from 'editor/src/app/utils/variable-info-validator';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { IdReplacement, IdReplacementTarget } from 'editor/src/app/utils/id-replacement';
import { DropListElement } from 'common/models/elements/drop-list';
import { IDTypes } from 'common/models/id-interfaces';

/**
 * Holds the unit the editor is working on, and is the only place it is replaced.
 *
 * The public subjects are how the rest of the editor learns that something changed. Three of them
 * carry the id of the element they concern, and their subscribers act on that id rather than reading
 * the unit again; the others carry nothing. `updateUnitDefinition` is what reports a changed unit to
 * the host.
 *
 * Two private signals separate the two moments a load has, because dialogs need different ones: a
 * dialog that belongs to a LOAD is superseded when the next load starts, while a dialog that belongs
 * to the UNIT -- a delete waiting for confirmation -- has to know when the unit under it is actually
 * gone, which a load ending in an error or in the sanitization dialog never does (#1247, #1253).
 */
@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: EditorUnit;
  elementPropertyUpdated: Subject<void> = new Subject<void>();
  geometryElementPropertyUpdated: Subject<string> = new Subject<string>();
  mathTableElementPropertyUpdated: Subject<string> = new Subject<string>();
  tablePropUpdated: Subject<string> = new Subject<string>();
  tetfolioElementPropertyUpdated: Subject<string> = new Subject<string>();
  sectionCountUpdated: Subject<void> = new Subject<void>();
  pageOrderChanged: Subject<void> = new Subject<void>();
  /** The variables of the unit that break the Verona contract, renewed whenever the unit is reported (#1129). */
  variableInfoFindings = new BehaviorSubject<VariableInfoFinding[]>([]);
  referenceManager: ReferenceManager;
  savedSectionCode: string | undefined;
  allowExpertMode: boolean = true;
  expertMode: boolean = true;
  /** A pending sanitization dialog holds the definition of the load that opened it. Every further load
     supersedes it: confirming it later would replace the unit that is loaded by then and report the
     older one to the host under the newer session. Announcing the newer load is all this side has to
     do -- the dialog is then closed and its result no longer reaches the callback below (#1247). */
  private loadSuperseded = new Subject<void>();
  /** Fires once `unit` has actually been swapped. The load above announces its own start, which is what
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
       * the unit to the host as changed, and a discard must not hand back a fresh change at once.
       * The findings are renewed all the same, or those of the unit just left would stay on display. */
      this.idService.reset();
      this.selectionService.reset();
      this.unit = new EditorUnit(undefined, this.idService);
      this.referenceManager = new ReferenceManager(this.unit);
      this.updateSectionCounter();
      this.refreshVariableInfoFindings();
      this.unitReplaced.next();
    }
  }

  private loadUnit(migratedUnitDefinition?: UnitProperties): void {
    this.idService.reset();
    this.selectionService.reset();
    this.unit = new EditorUnit(migratedUnitDefinition, this.idService);
    this.reRegisterAll();
    this.referenceManager = new ReferenceManager(this.unit);
    /* As early as the unit and its reference manager are in place: everything below can throw into the
       error dialog of loadUnitDefinition, and the unit would be replaced all the same. */
    this.unitReplaced.next();

    const repair = this.referenceManager.repairInvalidReferences();
    if (repair.repaired.length > 0 || repair.toCheck.length > 0) this.messageService.showFixedReferencePanel(repair);
    if (repair.repaired.length > 0) this.updateUnitDefinition();
    // The unit constructor updated the version. Therefore the unit has changed and notifies the  host.
    if (migratedUnitDefinition?.version !== VersionManager.getCurrentVersion()) {
      this.updateUnitDefinition();
    }
    this.updateSectionCounter();
    /* Units stored before #1043 can carry identifiers the contract forbids. The author is shown where, once per
       load and only for what can be fixed in the editor; the rest stays reachable through the indicator. */
    const findings = this.refreshVariableInfoFindings();
    if (findings.some(finding => finding.holdsBackList)) this.dialogService.showVariableInfoFindingsDialog();
  }

  /**
   * Reports the unit to the host together with its variables -- all of them, or none while the author still has
   * something to correct. A partial list is worse than none: the host stores it, and studio drops the codings and
   * the metadata of every variable missing from it. Sent without a list, studio keeps the one it has (#1129).
   */
  updateUnitDefinition(): void {
    const origins = VariableInfoOrigins.collect(this.unit);
    const findings = this.refreshVariableInfoFindings(origins);
    this.veronaApiService.sendChanged(
      UnitService.createUnitDefinition(this.unit),
      `${this.unit.type}@${this.unit.version}`,
      findings.some(finding => finding.holdsBackList) ? undefined : origins.map(origin => origin.info));
  }

  private refreshVariableInfoFindings(
    origins: VariableInfoOrigin[] = VariableInfoOrigins.collect(this.unit)
  ): VariableInfoFinding[] {
    const issuesByIndex = new Map<number, VariableInfoIssue[]>();
    VariableInfoValidator.validate(origins.map(origin => origin.info))
      .forEach(issue => issuesByIndex.set(issue.index, [...(issuesByIndex.get(issue.index) ?? []), issue]));
    const findings = [...issuesByIndex.entries()]
      .sort(([indexA], [indexB]) => indexA - indexB)
      .map(([index, issues]) => ({
        origin: origins[index], issues, holdsBackList: issues.some(issue => issue.part === 'alias')
      }));
    this.variableInfoFindings.next(findings);
    return findings;
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

  /** Used by props panel to show available dropLists to connect */
  getAllDropListElementIDs(): { id: string, alias: string }[] {
    const allDropLists = this.unit.getAllElements('drop-list');
    return allDropLists.map(dropList => ({ id: dropList.id, alias: dropList.alias }));
  }

  updateStateVariables(stateVariables: StateVariable[]): void {
    this.unit.stateVariables = stateVariables;
    this.reRegisterAll();
    this.updateUnitDefinition();
  }

  /** Opens the state variables for editing. A cancelled dialog may have registered aliases on the way, which
      re-registering takes back. */
  editStateVariables(): void {
    /* The dialog result belongs to the unit it was opened on; a unit the host loaded meanwhile must not get it. */
    const unitAtRequest = this.unit;
    this.dialogService.showStateVariablesDialog(this.unit.stateVariables)
      .subscribe(stateVariables => {
        if (this.unit !== unitAtRequest) return;
        if (stateVariables) {
          this.applyEditedStateVariables(stateVariables, unitAtRequest);
        } else {
          this.reRegisterAll();
        }
      });
  }

  /**
   * Takes over what the dialog returned. A variable it no longer holds may still be set by a button or a trigger, or
   * be asked by a visibility rule; that is asked first, as deleting an element is, and the references go with the
   * variable only once the author agreed. Declined, the variables still referred to stay, and everything else the
   * dialog changed is taken over all the same (#1509).
   */
  private applyEditedStateVariables(stateVariables: StateVariable[], unitAtRequest: EditorUnit): void {
    const removed = this.unit.stateVariables
      .filter(stateVariable => !stateVariables.some(kept => kept.id === stateVariable.id));
    const refs = this.referenceManager.getStateVariableReferences(removed);
    if (refs.length === 0) {
      this.updateStateVariables(stateVariables);
      return;
    }
    this.dialogService.showDeleteConfirmDialog(
      this.translateService.instant('deleteStateVariablesConfirm'), this.unitReplaced, undefined, refs)
      .subscribe(confirmed => {
        if (this.unit !== unitAtRequest) return;
        if (confirmed) {
          ReferenceManager.deleteReferences(refs);
          this.updateStateVariables(stateVariables);
        } else {
          const referred = removed.filter(stateVariable => refs
            .some(refList => (refList.element as { id: string }).id === stateVariable.id));
          this.updateStateVariables([...stateVariables, ...referred]);
          this.messageService.showReferencePanel(refs);
        }
      });
  }

  /**
   * Gives elements and state variables a new id where their own breaks the Verona contract (#1508). The new id comes
   * from the generator, as for any new element; everything that refers to the old one follows it, and what is derived
   * from the id is renewed. Each id is asked right before it is replaced, so of two that differ only in letter case
   * one is enough. The alias stays as it is: it is what the player stores the responses under.
   */
  replaceIds(targets: IdReplacementTarget[]): void {
    let replacedCount = 0;
    targets.forEach(target => {
      const holder: ReferenceHolder = target.element ?? target.stateVariable;
      const oldID = holder.id;
      /* Compared as the validator compares: with every variable id of the unit, a GeoGebra variable's
         `<element id>_<name>` included, leaving out only the ids the holder brings itself. */
      const otherIDs = VariableInfoOrigins.collect(this.unit)
        .filter(origin => (origin.location?.element ?? origin.stateVariable) !== holder)
        .map(origin => origin.info.id);
      if (!IdReplacement.needsReplacement(oldID, otherIDs)) return;
      const twins = [...this.unit.getAllElements(), ...this.unit.stateVariables]
        .filter(other => other !== holder && other.id === oldID);
      const newID = this.idService
        .getAndRegisterNewID(target.element ? target.element.type as IDTypes : 'state-variable');
      // A twin with exactly the same id shares the registration, which therefore stays.
      if (twins.length === 0) this.idService.unregister(oldID, true, false);
      this.referenceManager.replaceReferences(oldID, newID, holder, twins);
      holder.id = newID;
      if (target.element?.type === 'drop-list') {
        const dropList = target.element as DropListElement;
        dropList.setProperty('value', dropList.value); // renews the options' originListID
      }
      if (target.element?.type === 'geometry') {
        // The applet is injected into the element named by the id, which the template renames on the next check.
        setTimeout(() => this.geometryElementPropertyUpdated.next(newID));
      }
      replacedCount += 1;
    });
    if (replacedCount === 0) return;
    // The properties panel of a selected element would otherwise go on showing references by the old ids.
    this.elementPropertyUpdated.next();
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

  /** Check references and confirm */
  prepareDelete(deletedObjectType: 'page' | 'section' | 'elements',
                object: EditorPage | Section | UIElement[],
                pageIndex?: number): Promise<boolean> {
    return new Promise(resolve => {
      const unitAtRequest = this.unit;
      let refs: ReferenceList[] = [];
      let dialogText: string = '';
      switch (deletedObjectType) {
        case 'page': {
          if (pageIndex === undefined) throw Error();
          /* The page handed in, not the selected one: the references belong to the page that goes. Both page menus
             select their page before they open, so the two agree today; reading the selection instead would check
             -- and on confirmation remove -- the references of another page as soon as they did not (#1509). */
          refs = this.referenceManager.getPageElementsReferences(object as EditorPage);
          const pageNavButtonRefs = this.referenceManager.getButtonReferencesForPage(pageIndex);
          refs = refs.concat(pageNavButtonRefs);
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

  /** Only a section this page holds, and not its first one, can start a new page. Both ends leave a page
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

    this.keepPageNavigation(() => this.unit.pages.splice(pageIndex + 1, 0, newPage));
    this.selectionService.selectedPageIndex = pageIndex + 1;
    this.selectionService.selectedSectionIndex = 0;
    this.updateUnitDefinition();
  }

  /** There has to be a regular page before this one to hand the sections to: page 0 has none at all, and
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
    this.keepPageNavigation(
      () => this.unit.deletePage(pageIndex),
      new Map([[this.unit.pages[pageIndex], this.unit.pages[pageIndex - 1]]])
    );
    this.updateUnitDefinition();
  }

  /**
   * Runs a step that adds, removes or reorders pages so that every navigation button still leads to the page it
   * led to before: a button stores a page number, and the step renumbers the pages (#1511). `mergedInto` is for a
   * step that hands a page's content to another page and removes it.
   */
  keepPageNavigation(operation: () => void, mergedInto?: Map<Page, Page>): void {
    const targets = this.referenceManager.capturePageTargets();
    operation();
    // Not every step drops the element selection, so a selected button would still show its old target.
    if (this.referenceManager.restorePageTargets(targets, mergedInto)) this.elementPropertyUpdated.next();
  }
}
