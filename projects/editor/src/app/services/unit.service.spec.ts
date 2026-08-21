import { fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Mock } from 'vitest';
import { VersionManager } from 'common/services/version-manager';
import { UnitProperties } from 'common/models/unit';
import { StateVariable } from 'common/models/state-variable';
import { MessageService } from 'editor/src/app/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { VariableInfo } from '@iqb/responses';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import { VeronaAPIService } from 'editor/src/app/services/verona-api.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { PageService } from 'editor/src/app/services/page.service';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
import {
  SanitizationDialogComponent
} from 'editor/src/app/components/dialogs/sanitization-dialog/sanitization-dialog.component';

describe('UnitService - rapid load handling', () => {
  let service: UnitService;
  let dialogServiceSpy: SpyObj<DialogService>;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;
  let messageServiceSpy: SpyObj<MessageService>;

  beforeEach(() => {
    const selectionService = new SelectionService();
    const idService = new IDService();
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);
    messageServiceSpy = createSpyObj<MessageService>([
      'showFixedReferencePanel',
      'showReferencePanel',
      'showPrompt'
    ]);
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);

    dialogServiceSpy = createSpyObj<DialogService>([
      'showUnitDefErrorDialog',
      'showDeleteConfirmDialog'
    ]);

    service = new UnitService(
      selectionService,
      veronaApiServiceSpy,
      messageServiceSpy,
      dialogServiceSpy,
      idService,
      translateServiceSpy
    );
  });

  it('loads the latest compatible unit when multiple standard loads happen rapidly', () => {
    for (let i = 1; i <= 20; i += 1) {
      service.loadUnitDefinition(JSON.stringify(createUnitBlueprint(`unit-${i}`)));
    }

    expect(service.unit.stateVariables[0].id).toBe('unit-20');
    expect(dialogServiceSpy.showUnitDefErrorDialog).not.toHaveBeenCalled();
  });

  it('does not report unit definition errors for repeated standard reloads of the same unit', () => {
    const sameUnit = JSON.stringify(createUnitBlueprint('stable-unit'));

    for (let i = 0; i < 50; i += 1) {
      service.loadUnitDefinition(sameUnit);
    }

    expect(service.unit.stateVariables[0].id).toBe('stable-unit');
    expect(dialogServiceSpy.showUnitDefErrorDialog).not.toHaveBeenCalled();
  });
});

describe('UnitService - variable info validation (#1043)', () => {
  let service: UnitService;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;
  let messageServiceSpy: SpyObj<MessageService>;

  beforeEach(() => {
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);
    messageServiceSpy = createSpyObj<MessageService>([
      'showFixedReferencePanel',
      'showReferencePanel',
      'showPrompt'
    ]);
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);

    service = new UnitService(
      new SelectionService(),
      veronaApiServiceSpy,
      messageServiceSpy,
      createSpyObj<DialogService>(['showUnitDefErrorDialog', 'showDeleteConfirmDialog']),
      new IDService(),
      translateServiceSpy
    );
  });

  it('does not report variable infos with invalid aliases to the host', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('März')));
    service.updateUnitDefinition();

    const reportedVariableInfos = veronaApiServiceSpy.sendChanged.mock.lastCall?.[2] as VariableInfo[];
    expect(reportedVariableInfos.length).toBe(0);
  });

  it('notifies the user when a loaded unit contains invalid aliases', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('weiter ')));
    expect(messageServiceSpy.showPrompt).toHaveBeenCalledWith('invalidVariableAliases');
  });

  it('keeps reporting valid variable infos and shows no prompt', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('valid_var-1')));
    service.updateUnitDefinition();

    const reportedVariableInfos = veronaApiServiceSpy.sendChanged.mock.lastCall?.[2] as VariableInfo[];
    expect(reportedVariableInfos.length).toBe(1);
    expect(reportedVariableInfos[0].alias).toBe('valid_var-1');
    expect(messageServiceSpy.showPrompt).not.toHaveBeenCalled();
  });
});

describe('UnitService - discarding a unit that was never saved with content (#1089)', () => {
  let service: UnitService;
  let selectionService: SelectionService;
  let idService: IDService;

  beforeEach(() => {
    selectionService = new SelectionService();
    idService = new IDService();
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);

    service = new UnitService(
      selectionService,
      createSpyObj<VeronaAPIService>(['sendChanged']),
      createSpyObj<MessageService>(['showFixedReferencePanel', 'showReferencePanel', 'showPrompt']),
      createSpyObj<DialogService>(['showUnitDefErrorDialog', 'showDeleteConfirmDialog']),
      idService,
      translateServiceSpy
    );
  });

  const loadTwoSectionUnit = (): void => {
    const blueprint = createUnitBlueprint('discarded-unit');
    blueprint.pages[0].sections.push({ ...blueprint.pages[0].sections[0] });
    service.loadUnitDefinition(JSON.stringify(blueprint));
  };

  /* The host replays the stored definition on every load, and for a unit that was never saved with
     content that definition is empty -- so discarding lands in the empty branch, which replaces the
     unit with a fresh one holding a single section. */
  it('resets the section selection when the host reloads an empty unit definition', () => {
    loadTwoSectionUnit();
    selectionService.updateSelection(0, 1);

    service.loadUnitDefinition('');

    expect(selectionService.selectedSectionIndex).toBe(0);
  });

  it('leaves no selection pointing past the end of the reloaded unit', () => {
    loadTwoSectionUnit();
    selectionService.updateSelection(0, 1);

    service.loadUnitDefinition('');

    /* Exactly what position-field-set and dimension-field-set index into. Undefined here is the
       TypeError that the error dialog then re-triggers through change detection, over and over. */
    expect(service.unit.pages[selectionService.selectedPageIndex]
      .sections[selectionService.selectedSectionIndex]).toBeDefined();
  });

  /* The other half of the fix, reached through the branch rather than through reset() directly: an
     empty unit renders no overlay, so nothing re-selects, and a surviving selection keeps the
     properties panel mounted on top of the section indices above. */
  it('drops the element selection when the host reloads an empty unit definition', () => {
    loadTwoSectionUnit();
    selectionService.selectElement({
      elementComponent: {
        element: new TextElement({ type: 'text', id: 'text_1', alias: 'text_1' }),
        setSelected: () => {}
      } as unknown as ElementOverlay,
      multiSelect: false
    });

    service.loadUnitDefinition('');

    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  it('clears the id registry of the discarded unit', () => {
    loadTwoSectionUnit();

    service.loadUnitDefinition('');

    /* Without this the ids of the discarded unit stay registered and the next element the user
       creates is numbered around them. */
    expect(idService.isIDAvailable('discarded-unit')).toBe(true);
  });
});

/* The sanitization dialog stays open until the user confirms it, and the definition it carries is the
   one read when it opened. What keeps a later load safe is the interplay of UnitService and
   DialogService, so these tests use the real DialogService and fake only MatDialog itself (#1247). */
describe('UnitService - a load superseded while its sanitization dialog is open (#1247)', () => {
  let service: UnitService;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;
  let dialogOpen: Mock;
  let afterClosed: Subject<boolean>;
  let close: Mock;

  beforeEach(() => {
    afterClosed = new Subject<boolean>();
    /* Like MatDialogRef: the result is never reported from inside close() but once the dialog is gone,
       and the stream then ends, so a click on a dialog that is no longer there cannot reach the
       caller. The delay is what puts the report after the load that caused it -- the order the bug
       needs. */
    close = vi.fn((result?: boolean) => {
      Promise.resolve().then(() => {
        afterClosed.next(result as boolean);
        afterClosed.complete();
      });
    });
    dialogOpen = vi.fn().mockReturnValue({ afterClosed: () => afterClosed, close });
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);

    service = new UnitService(
      new SelectionService(),
      veronaApiServiceSpy,
      createSpyObj<MessageService>(['showFixedReferencePanel', 'showReferencePanel', 'showPrompt']),
      new DialogService({ open: dialogOpen } as unknown as MatDialog),
      new IDService(),
      translateServiceSpy
    );
  });

  /* Only a lesser major version from 3.10.0 on takes the dialog path; anything from 4.0.0 on migrates
     silently. The expectation keeps the tests below from passing without a dialog at all, should that
     lower bound ever move. */
  const loadOutdatedUnit = (marker: string): void => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint(marker, '3.10.0')));
    expect(dialogOpen).toHaveBeenCalledWith(SanitizationDialogComponent, { disableClose: true });
  };

  it('migrates the outdated unit when the user confirms its own dialog', () => {
    loadOutdatedUnit('outdated-unit');

    afterClosed.next(true);

    expect(service.unit.stateVariables[0].id).toBe('outdated-unit');
    expect(service.unit.version).toBe(VersionManager.getCurrentVersion());
  });

  it('takes the dialog away with the load it belongs to', () => {
    loadOutdatedUnit('outdated-unit');

    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('current-unit')));

    expect(close).toHaveBeenCalledWith(false);
  });

  it('does not take the close it caused itself for a confirmation', fakeAsync(() => {
    loadOutdatedUnit('outdated-unit');

    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('current-unit')));
    tick();

    expect(service.unit.stateVariables[0].id).toBe('current-unit');
  }));

  /* Since the dialog is taken away rather than left for the user, the click #1247 needs is one she can
     only land in the moment it goes away. */
  it('ignores a confirmation that reaches the superseded dialog while it closes', fakeAsync(() => {
    loadOutdatedUnit('outdated-unit');

    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('current-unit')));
    afterClosed.next(true);
    tick();

    expect(service.unit.stateVariables[0].id).toBe('current-unit');
  }));

  /* The other half of the loss: updateUnitDefinition reports to the host under whatever session the
     latest start command left behind, so the outdated unit would be stored as the newer one. */
  it('reports no such confirmation to the host', fakeAsync(() => {
    loadOutdatedUnit('outdated-unit');

    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('current-unit')));
    afterClosed.next(true);
    tick();

    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  }));
});

/* A delete waits for its confirmation, and the object, the references and the index the caller kept all
   belong to the unit as it was then. A start command arriving in between replaces that unit, so these
   tests use the real DialogService and fake only MatDialog itself (#1253). */
describe('UnitService - a delete whose unit is replaced while the confirmation is open (#1253)', () => {
  let service: UnitService;
  let selectionService: SelectionService;
  let messageServiceSpy: SpyObj<MessageService>;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;
  let afterClosed: Subject<boolean>;
  let close: Mock;

  beforeEach(() => {
    afterClosed = new Subject<boolean>();
    /* Like MatDialogRef: the result is reported once the dialog is gone, not from inside close(). */
    close = vi.fn((result?: boolean) => {
      Promise.resolve().then(() => {
        afterClosed.next(result as boolean);
        afterClosed.complete();
      });
    });
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    selectionService = new SelectionService();
    messageServiceSpy = createSpyObj<MessageService>([
      'showFixedReferencePanel', 'showReferencePanel', 'showPrompt'
    ]);
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);

    service = new UnitService(
      selectionService,
      veronaApiServiceSpy,
      messageServiceSpy,
      new DialogService({
        open: vi.fn().mockReturnValue({ afterClosed: () => afterClosed, close })
      } as unknown as MatDialog),
      new IDService(),
      translateServiceSpy
    );
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('unit-to-delete-from')));
  });

  /* Two pages, so that a delete carried over from the unit before finds something at its index to
     remove -- with fewer pages than the one it was asked for, the wrong splice would hit nothing. */
  const loadAnotherUnit = (): void => {
    const blueprint = createUnitBlueprint('unit-loaded-in-between');
    blueprint.pages.push({ ...blueprint.pages[0] });
    service.loadUnitDefinition(JSON.stringify(blueprint));
  };

  it('does not confirm the delete once the unit it was asked for is gone', fakeAsync(() => {
    let confirmed: boolean | undefined;
    service.prepareDelete('page', service.unit.pages[0], 0).then(result => { confirmed = result; });

    loadAnotherUnit();
    afterClosed.next(true);
    tick();

    expect(confirmed).toBe(false);
  }));

  /* Leaving it up would let the user answer a question about a unit that is no longer on screen; the
     answer is dropped either way, but the dialog has to go with its unit. */
  it('takes the confirmation dialog away with the unit it belongs to', fakeAsync(() => {
    service.prepareDelete('page', service.unit.pages[0], 0);

    loadAnotherUnit();
    tick();

    expect(close).toHaveBeenCalledWith(false);
  }));

  /* Discarding a unit goes through the empty branch, which swaps the unit just as a regular load does. */
  it('takes it away when the host discards the unit instead', fakeAsync(() => {
    service.prepareDelete('page', service.unit.pages[0], 0);

    service.loadUnitDefinition('');
    tick();

    expect(close).toHaveBeenCalledWith(false);
  }));

  /* The swap happens early in the load; everything after it can still throw into the error dialog, and
     the unit is replaced all the same. */
  it('takes it away even when the load fails after the unit was swapped', fakeAsync(() => {
    service.prepareDelete('page', service.unit.pages[0], 0);
    service.updateSectionCounter = vi.fn(() => { throw new Error('fails after the swap'); });

    loadAnotherUnit();
    tick();

    expect(close).toHaveBeenCalledWith(false);
  }));

  it('confirms the delete while the unit it was asked for is still loaded', fakeAsync(() => {
    let confirmed: boolean | undefined;
    service.prepareDelete('page', service.unit.pages[0], 0).then(result => { confirmed = result; });

    afterClosed.next(true);
    tick();

    expect(confirmed).toBe(true);
  }));

  /* Cancelling reports the references the deletion would have broken. Those name elements of the unit
     that is gone, so a replaced unit must not bring up that panel. */
  it('does not offer the references of the replaced unit', fakeAsync(() => {
    const references: ReferenceList[] = [{ element: { alias: 'page_1', type: 'page' }, refs: [] }];
    service.referenceManager.getPageElementsReferences = vi.fn(() => references);
    service.prepareDelete('page', service.unit.pages[0], 0);

    loadAnotherUnit();
    tick();

    expect(messageServiceSpy.showReferencePanel).not.toHaveBeenCalled();
  }));

  it('offers them when the user cancels the delete herself', fakeAsync(() => {
    const references: ReferenceList[] = [{ element: { alias: 'page_1', type: 'page' }, refs: [] }];
    service.referenceManager.getPageElementsReferences = vi.fn(() => references);
    service.prepareDelete('page', service.unit.pages[0], 0);

    afterClosed.next(false);
    tick();

    expect(messageServiceSpy.showReferencePanel).toHaveBeenCalledWith(references);
  }));

  /* The loss the ticket describes, through the caller that keeps the index: the page at that position
     in the newly loaded unit would be the one to go. */
  it('leaves the newly loaded unit untouched when the delete is confirmed', fakeAsync(() => {
    const pageService = new PageService(service, selectionService);
    service.unit.pages.push(service.unit.pages[0]);
    pageService.deletePage(1);

    loadAnotherUnit();
    afterClosed.next(true);
    tick();

    expect(service.unit.stateVariables[0].id).toBe('unit-loaded-in-between');
    expect(service.unit.pages.length).toBe(2);
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  }));
});

/* The page break moves the sections from the chosen one onwards to a new page. Which section is chosen
   comes from the selection indices, and the button that starts it stands on every page, so the index
   can name a section of another page (#1203). */
describe('UnitService - page break (#1203)', () => {
  let service: UnitService;
  let selectionService: SelectionService;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;

  beforeEach(() => {
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    selectionService = new SelectionService();
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);
    service = new UnitService(
      selectionService,
      veronaApiServiceSpy,
      createSpyObj<MessageService>(['showFixedReferencePanel', 'showReferencePanel', 'showPrompt']),
      createSpyObj<DialogService>(['showUnitDefErrorDialog']),
      new IDService(),
      translateServiceSpy
    );
    /* Two pages, the first with three sections: the second page's button carries index 1, which names
       nothing on a page that holds one section. */
    const blueprint = createUnitBlueprint('unit-with-two-pages');
    blueprint.pages[0].sections.push({ ...blueprint.pages[0].sections[0] });
    blueprint.pages[0].sections.push({ ...blueprint.pages[0].sections[0] });
    blueprint.pages.push({ ...blueprint.pages[0], sections: [{ ...blueprint.pages[0].sections[0] }] });
    service.loadUnitDefinition(JSON.stringify(blueprint));
  });

  it('moves the chosen section and the ones after it to a new page', () => {
    service.moveSectionToNewpage(0, 1);

    expect(service.unit.pages.length).toBe(3);
    expect(service.unit.pages[0].sections.length).toBe(1);
    expect(service.unit.pages[1].sections.length).toBe(2);
    expect(selectionService.selectedPageIndex).toBe(1);
    expect(selectionService.selectedSectionIndex).toBe(0);
  });

  /* The index belongs to another page, which held more sections. Nothing is moved, and the new page
     would be one without sections -- the state the properties panel reads `sections[0]` from (#1089),
     endlessly through #1202. */
  it('does not build a page without sections for a section index the page does not hold', () => {
    service.moveSectionToNewpage(1, 1);

    expect(service.unit.pages.length).toBe(2);
    expect(service.unit.pages[1].sections.length).toBe(1);
    expect(selectionService.selectedPageIndex).toBe(0);
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  });

  /* Breaking at the first section would move every section away and leave THIS page without any. */
  it('does not empty the page it breaks', () => {
    service.moveSectionToNewpage(0, 0);

    expect(service.unit.pages.length).toBe(2);
    expect(service.unit.pages[0].sections.length).toBe(3);
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  });
});

/* Removing a page break hands a page's sections to the page before it and deletes the page. The page
   before it may be the permanently visible one, which is not a page they may land on (#1298). */
describe('UnitService - removing a page break (#1298)', () => {
  let service: UnitService;
  let selectionService: SelectionService;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;

  const loadPages = (alwaysVisibleFirst: boolean): void => {
    const blueprint = createUnitBlueprint('unit-with-two-pages');
    blueprint.pages[0].alwaysVisible = alwaysVisibleFirst;
    blueprint.pages.push({ ...blueprint.pages[0], alwaysVisible: false });
    service.loadUnitDefinition(JSON.stringify(blueprint));
  };

  beforeEach(() => {
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    selectionService = new SelectionService();
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);
    service = new UnitService(
      selectionService,
      veronaApiServiceSpy,
      createSpyObj<MessageService>(['showFixedReferencePanel', 'showReferencePanel', 'showPrompt']),
      createSpyObj<DialogService>(['showUnitDefErrorDialog']),
      new IDService(),
      translateServiceSpy
    );
  });

  it('hands the sections to the page before it and takes the page away', () => {
    loadPages(false);

    service.collapsePage(1);

    expect(service.unit.pages.length).toBe(1);
    expect(service.unit.pages[0].sections.length).toBe(2);
    expect(selectionService.selectedPageIndex).toBe(0);
    expect(selectionService.selectedSectionIndex).toBe(1);
  });

  /* The sections would be shown alongside every other page from then on, and the unit would be left
     with nothing but its permanently visible page -- the state the page menu's delete button locks. */
  it('does not hand them to the permanently visible page', () => {
    loadPages(true);

    service.collapsePage(1);

    expect(service.unit.pages.length).toBe(2);
    expect(service.unit.pages[0].sections.length).toBe(1);
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  });

  it('does not collapse the first page, which has none before it', () => {
    loadPages(false);

    service.collapsePage(0);

    expect(service.unit.pages.length).toBe(2);
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  });
});

function createUnitBlueprint(marker: string, version: string = VersionManager.getCurrentVersion()): UnitProperties {
  return {
    type: 'aspect-unit-definition',
    version,
    stateVariables: [new StateVariable(marker, marker, marker)],
    pages: [
      {
        sections: [
          {
            elements: [],
            height: 400,
            backgroundColor: '#ffffff',
            dynamicPositioning: true,
            autoColumnSize: true,
            autoRowSize: true,
            gridColumnSizes: [{ value: 1, unit: 'fr' }],
            gridRowSizes: [{ value: 1, unit: 'fr' }],
            visibilityDelay: 0,
            animatedVisibility: false,
            enableReHide: false,
            logicalConnectiveOfRules: 'disjunction',
            visibilityRules: [],
            ignoreNumbering: false
          }
        ],
        hasMaxWidth: true,
        maxWidth: 750,
        margin: 30,
        backgroundColor: '#ffffff',
        alwaysVisible: false,
        alwaysVisiblePagePosition: 'left',
        alwaysVisibleAspectRatio: 50
      }
    ],
    enableSectionNumbering: false,
    sectionNumberingPosition: 'left',
    showUnitNavNext: false
  };
}
