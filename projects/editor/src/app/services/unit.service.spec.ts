import { fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { Mock } from 'vitest';
import { VersionManager } from 'common/services/version-manager';
import { UnitProperties } from 'common/models/unit';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/drop-list';
import { ButtonElement } from 'common/models/elements/button';
import { GeometryElement } from 'common/models/elements/geometry';
import { StateVariable } from 'common/models/state-variable';
import { MessageService } from 'editor/src/app/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { TextElement } from 'common/models/elements/text';
import { TextFieldElement } from 'common/models/elements/text-field';
import { CheckboxElement } from 'common/models/elements/checkbox';
import { MathTableElement } from 'common/models/elements/math-table';
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

describe('UnitService - variable info validation (#1043, #1129)', () => {
  let service: UnitService;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;
  let messageServiceSpy: SpyObj<MessageService>;
  let dialogServiceSpy: SpyObj<DialogService>;

  const unitWithStateVariables = (...stateVariables: StateVariable[]): string => JSON.stringify({
    ...createUnitBlueprint('unused'), stateVariables
  });
  const lastReportedVariables = (): VariableInfo[] | undefined => veronaApiServiceSpy.sendChanged.mock.lastCall?.[2];

  beforeEach(() => {
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);
    messageServiceSpy = createSpyObj<MessageService>([
      'showFixedReferencePanel',
      'showReferencePanel',
      'showPrompt'
    ]);
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    dialogServiceSpy = createSpyObj<DialogService>([
      'showUnitDefErrorDialog', 'showDeleteConfirmDialog', 'showVariableInfoFindingsDialog', 'showStateVariablesDialog'
    ]);

    service = new UnitService(
      new SelectionService(),
      veronaApiServiceSpy,
      messageServiceSpy,
      dialogServiceSpy,
      new IDService(),
      translateServiceSpy
    );
  });

  /* A partial list would be stored by the host as the whole one, and studio drops the codings and metadata of
     every variable missing from it. Without a list it keeps the one it has. */
  it('sends no variable list at all while an alias needs correcting', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('März')));
    service.updateUnitDefinition();

    expect(veronaApiServiceSpy.sendChanged).toHaveBeenCalled();
    expect(lastReportedVariables()).toBeUndefined();
  });

  it('shows the findings when a loaded unit has something to correct', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('weiter ')));

    expect(dialogServiceSpy.showVariableInfoFindingsDialog).toHaveBeenCalled();
    expect(service.variableInfoFindings.value.map(finding => finding.origin.info.id)).toEqual(['weiter ']);
    expect(messageServiceSpy.showPrompt).not.toHaveBeenCalled();
  });

  it('holds back the list for aliases that differ only in letter case', () => {
    service.loadUnitDefinition(unitWithStateVariables(
      new StateVariable('state_1', 'Wert', ''), new StateVariable('state_2', 'wert', '')
    ));
    service.updateUnitDefinition();

    expect(lastReportedVariables()).toBeUndefined();
    expect(service.variableInfoFindings.value.flatMap(finding => finding.issues.map(issue => issue.code)))
      .toEqual(['DUPLICATE_ALIAS', 'DUPLICATE_ALIAS']);
  });

  it('reports the whole list again once the alias is corrected', () => {
    service.loadUnitDefinition(unitWithStateVariables(
      new StateVariable('state_1', 'März', ''), new StateVariable('state_2', 'other', '')
    ));
    service.unit.stateVariables[0].alias = 'Maerz';
    service.updateUnitDefinition();

    expect(lastReportedVariables()?.map(info => info.alias)).toEqual(['Maerz', 'other']);
    expect(service.variableInfoFindings.value).toEqual([]);
  });

  /* The id is not editable since editor 2.6.0. Holding back the list for it would hold it back forever (#1508). */
  it('reports an invalid id that cannot be corrected in the editor, but sends the whole list', () => {
    service.loadUnitDefinition(unitWithStateVariables(new StateVariable('März', 'maerz', '')));
    service.updateUnitDefinition();

    expect(lastReportedVariables()?.map(info => info.id)).toEqual(['März']);
    expect(service.variableInfoFindings.value.map(finding => finding.holdsBackList)).toEqual([false]);
    expect(dialogServiceSpy.showVariableInfoFindingsDialog).not.toHaveBeenCalled();
  });

  it('keeps reporting valid variable infos and shows no findings', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('valid_var-1')));
    service.updateUnitDefinition();

    const reportedVariableInfos = lastReportedVariables() as VariableInfo[];
    expect(reportedVariableInfos.length).toBe(1);
    expect(reportedVariableInfos[0].alias).toBe('valid_var-1');
    expect(service.variableInfoFindings.value).toEqual([]);
    expect(dialogServiceSpy.showVariableInfoFindingsDialog).not.toHaveBeenCalled();
  });

  it('drops the findings of the unit left when an empty unit is loaded', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('März')));
    service.loadUnitDefinition('');

    expect(service.variableInfoFindings.value).toEqual([]);
  });

  it('applies edited state variables and reports them', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('März')));
    const edited = [new StateVariable('März', 'Maerz', '')];
    dialogServiceSpy.showStateVariablesDialog.mockReturnValue(of(edited));

    service.editStateVariables();

    expect(service.unit.stateVariables).toBe(edited);
    expect(lastReportedVariables()?.map(info => info.alias)).toEqual(['Maerz']);
  });

  it('takes back what a cancelled state variables dialog registered', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('state_1')));
    const reRegisterAll = vi.spyOn(service, 'reRegisterAll');
    dialogServiceSpy.showStateVariablesDialog.mockReturnValue(of(undefined));

    service.editStateVariables();

    expect(reRegisterAll).toHaveBeenCalled();
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  });

  /* The host stores this list as it arrives. It follows VariableInfo 2.0: `type` and `format` in upper
     case, and no `page` (#1150). No end-to-end test can see it -- under Cypress the editor counts as
     standalone and posts nothing to a host. */
  it('reports its variables in the spelling of VariableInfo 2.0', () => {
    service.loadUnitDefinition(JSON.stringify(createUnitBlueprint('state_1')));
    const section = service.unit.pages[0].sections[0];
    section.addElement(new TextFieldElement({ type: 'text-field', id: 'text-field_1', alias: 'text-field_1' }));
    section.addElement(new CheckboxElement({ type: 'checkbox', id: 'checkbox_1', alias: 'checkbox_1' }));
    section.addElement(new MathTableElement({
      type: 'math-table', id: 'math-table_1', alias: 'math-table_1', operation: 'addition'
    }));
    service.updateUnitDefinition();

    const reportedVariableInfos = veronaApiServiceSpy.sendChanged.mock.lastCall?.[2] as VariableInfo[];
    expect(reportedVariableInfos.map(info => `${info.id} ${info.type} ${info.format}`)).toEqual([
      'state_1 NO_VALUE ',
      'text-field_1 STRING ',
      'checkbox_1 BOOLEAN ',
      'math-table_1 JSON MATH_TABLE'
    ]);
    expect(reportedVariableInfos.filter(info => 'page' in info)).toEqual([]);
  });
});

/* Loading empties the registry and registers every element again. A drop-list registered its options only in its
   constructor, so after every load they were free: a new option could get `value_1` a second time, and an alias
   could take the name of an option without any error (#1506). */
describe('UnitService - registering the options of a drop-list (#1506)', () => {
  let service: UnitService;
  let idService: IDService;

  beforeEach(() => {
    idService = new IDService();
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    service = new UnitService(
      new SelectionService(),
      createSpyObj<VeronaAPIService>(['sendChanged']),
      createSpyObj<MessageService>(['showFixedReferencePanel', 'showReferencePanel', 'showPrompt']),
      createSpyObj<DialogService>([
        'showUnitDefErrorDialog', 'showVariableInfoFindingsDialog', 'showStateVariablesDialog'
      ]),
      idService,
      translateServiceSpy
    );
    const unit = createUnitBlueprint('state_1');
    unit.pages[0].sections[0].elements.push({
      type: 'drop-list',
      id: 'drop-list_1',
      alias: 'drop-list_1',
      value: [{ text: 'A', id: 'value_1', alias: 'option-a' }],
      position: {
        gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
      }
    } as unknown as PositionedUIElement);
    service.loadUnitDefinition(JSON.stringify(unit));
  });

  it('should keep the ids of the options taken after loading', () => {
    expect(idService.isIDAvailable('value_1')).toBe(false);
    expect(idService.isAliasAvailable('option-a')).toBe(false);
  });

  it('should keep them taken after the state variables were edited, which registers everything again', () => {
    service.reRegisterAll();

    expect(idService.isAliasAvailable('Option-A')).toBe(false);
  });
});

describe('UnitService - references to what is deleted (#1509)', () => {
  let service: UnitService;
  let selectionService: SelectionService;
  let messageServiceSpy: SpyObj<MessageService>;
  let dialogServiceSpy: SpyObj<DialogService>;

  const textField = (id: string): Record<string, unknown> => ({
    type: 'text-field',
    id,
    alias: id,
    position: {
      gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
    }
  });

  /* Two pages; a section on the second asks a state variable and an element of the first page. */
  const load = (secondPageRuleTargets: string[]): void => {
    const blueprint = createUnitBlueprint('state_1');
    blueprint.pages.push(JSON.parse(JSON.stringify(blueprint.pages[0])));
    blueprint.pages[0].sections[0].elements.push(textField('text-field_1') as unknown as PositionedUIElement);
    blueprint.pages[1].sections[0].elements.push(textField('text-field_2') as unknown as PositionedUIElement);
    blueprint.pages[1].sections[0].visibilityRules = secondPageRuleTargets
      .map(id => ({ id, operator: '=', value: '1' }));
    service.loadUnitDefinition(JSON.stringify(blueprint));
  };

  beforeEach(() => {
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    selectionService = new SelectionService();
    messageServiceSpy = createSpyObj<MessageService>(['showFixedReferencePanel', 'showReferencePanel', 'showPrompt']);
    dialogServiceSpy = createSpyObj<DialogService>([
      'showUnitDefErrorDialog', 'showDeleteConfirmDialog', 'showVariableInfoFindingsDialog', 'showStateVariablesDialog'
    ]);
    service = new UnitService(selectionService, createSpyObj<VeronaAPIService>(['sendChanged']), messageServiceSpy,
                              dialogServiceSpy, new IDService(), translateServiceSpy);
  });

  /* The page menus select their page before they open, so selection and deleted page agree in the editor today;
     the references are those of the deleted page all the same, whatever is selected. */
  it('should check the references of the page that is deleted, not of the selected one', async () => {
    load(['text-field_1']);
    selectionService.selectedPageIndex = 1;
    dialogServiceSpy.showDeleteConfirmDialog.mockReturnValue(of(true));

    await service.prepareDelete('page', service.unit.pages[0], 0);

    const refs = dialogServiceSpy.showDeleteConfirmDialog.mock.lastCall?.[3] as ReferenceList[];
    expect(refs.map(refList => (refList.element as { id: string }).id)).toEqual(['text-field_1']);
    expect(service.unit.pages[1].sections[0].visibilityRules).toEqual([]);
  });

  it('should ask before deleting a state variable that is still asked, and remove the rule once agreed', () => {
    load(['state_1']);
    dialogServiceSpy.showStateVariablesDialog.mockReturnValue(of([]));
    dialogServiceSpy.showDeleteConfirmDialog.mockReturnValue(of(true));

    service.editStateVariables();

    expect(dialogServiceSpy.showDeleteConfirmDialog)
      .toHaveBeenCalledWith('deleteStateVariablesConfirm', expect.anything(), undefined, expect.any(Array));
    expect(service.unit.stateVariables).toEqual([]);
    expect(service.unit.pages[1].sections[0].visibilityRules).toEqual([]);
  });

  /* Declining keeps what is still referred to, not the whole dialog undone: a rename made along the way stays. */
  it('should keep a referred state variable when the author declines, and take over the other changes', () => {
    load(['state_1']);
    dialogServiceSpy.showStateVariablesDialog.mockReturnValue(of([new StateVariable('state_2', 'neu', '')]));
    dialogServiceSpy.showDeleteConfirmDialog.mockReturnValue(of(false));

    service.editStateVariables();

    expect(service.unit.stateVariables.map(stateVariable => stateVariable.id)).toEqual(['state_2', 'state_1']);
    expect(service.unit.pages[1].sections[0].visibilityRules.length).toBe(1);
    expect(messageServiceSpy.showReferencePanel).toHaveBeenCalled();
  });

  it('should not apply a state variables dialog to a unit the host loaded while it was open', () => {
    load(['state_1']);
    const result = new Subject<StateVariable[]>();
    dialogServiceSpy.showStateVariablesDialog.mockReturnValue(result);
    service.editStateVariables();

    load([]);
    result.next([]);

    expect(dialogServiceSpy.showDeleteConfirmDialog).not.toHaveBeenCalled();
    expect(service.unit.stateVariables.map(stateVariable => stateVariable.id)).toEqual(['state_1']);
  });

  it('should delete a state variable nothing refers to without asking', () => {
    load([]);
    dialogServiceSpy.showStateVariablesDialog.mockReturnValue(of([]));

    service.editStateVariables();

    expect(dialogServiceSpy.showDeleteConfirmDialog).not.toHaveBeenCalled();
    expect(service.unit.stateVariables).toEqual([]);
  });

  /* Removing a rule into nothing would change what test takers see: with "and" its section is never shown now. */
  it('should report a visibility rule into nothing on loading, leave it, and report no change to the host', () => {
    load(['text-field_9']);

    expect(messageServiceSpy.showFixedReferencePanel).toHaveBeenCalledWith({
      repaired: [],
      toCheck: [expect.objectContaining({ pageIndex: 1, sectionIndex: 0 })]
    });
    expect(service.unit.pages[1].sections[0].visibilityRules.length).toBe(1);
  });
});

describe('UnitService - replacing ids that break the contract (#1508)', () => {
  let service: UnitService;
  let idService: IDService;
  let veronaApiServiceSpy: SpyObj<VeronaAPIService>;
  const position = (gridRow: number) => ({
    gridColumn: 1, gridColumnRange: 1, gridRow, gridRowRange: 1
  });

  beforeEach(() => {
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    idService = new IDService();
    veronaApiServiceSpy = createSpyObj<VeronaAPIService>(['sendChanged']);
    const messageServiceSpy = createSpyObj<MessageService>([
      'showFixedReferencePanel', 'showReferencePanel', 'showPrompt'
    ]);
    service = new UnitService(new SelectionService(), veronaApiServiceSpy, messageServiceSpy,
                              createSpyObj<DialogService>(['showUnitDefErrorDialog', 'showVariableInfoFindingsDialog']),
                              idService, translateServiceSpy);
    const blueprint = createUnitBlueprint('unused');
    blueprint.stateVariables = [new StateVariable('März', 'maerz', '')];
    blueprint.pages[0].sections[0].elements.push(...[
      {
        type: 'drop-list',
        id: 'Ablage 1',
        alias: 'ablage',
        position: position(1),
        value: [{ text: 'A', id: 'value_1', alias: 'option_a' }]
      },
      {
        type: 'drop-list',
        id: 'drop-list_2',
        alias: 'zweite',
        position: position(2),
        connectedTo: ['Ablage 1']
      },
      {
        type: 'text-field', id: 'Text_1', alias: 'erstes', position: position(3)
      },
      {
        type: 'text-field', id: 'text_1', alias: 'zweites', position: position(4)
      }
    ] as unknown as PositionedUIElement[]);
    blueprint.pages[0].sections[0].visibilityRules = [{ id: 'März', operator: '=', value: '1' }];
    service.loadUnitDefinition(JSON.stringify(blueprint));
  });

  const elementOf = (alias: string): UIElement => service.unit.getAllElements()
    .find(element => element.alias === alias) as UIElement;

  it('should give an element a generated id, register it and point the references at it', () => {
    const dropList = elementOf('ablage') as DropListElement;

    service.replaceIds([{ element: dropList }]);

    expect(dropList.id).toMatch(/^drop-list_\d+_\d+$/);
    expect(idService.isIDAvailable(dropList.id)).toBe(false);
    expect(idService.isIDAvailable('Ablage 1')).toBe(true);
    expect((elementOf('zweite') as DropListElement).connectedTo).toEqual([dropList.id]);
    expect(dropList.value[0].originListID).toBe(dropList.id);
    expect(dropList.alias).toBe('ablage');
  });

  it('should report the unit with the new id, drop the finding and refresh the properties panel', () => {
    const dropList = elementOf('ablage');
    const panelRefresh = vi.fn();
    service.elementPropertyUpdated.subscribe(panelRefresh);

    service.replaceIds([{ element: dropList }]);

    expect(panelRefresh).toHaveBeenCalled();

    const reported = veronaApiServiceSpy.sendChanged.mock.lastCall?.[2] as VariableInfo[];
    expect(reported.map(info => info.id)).toContain(dropList.id);
    expect(service.variableInfoFindings.value
      .some(finding => finding.origin.location?.element === dropList)).toBe(false);
  });

  it('should give a state variable a generated id and carry its visibility rule along', () => {
    const [stateVariable] = service.unit.stateVariables;

    service.replaceIds([{ stateVariable }]);

    expect(stateVariable.id).toMatch(/^state-variable_\d+_\d+$/);
    expect(service.unit.pages[0].sections[0].visibilityRules[0].id).toBe(stateVariable.id);
  });

  /* Each id is asked right before it is replaced: of a pair that differs only in letter case, one is enough, and
     only one variable loses its codings. */
  it('should replace only one of two ids that differ only in letter case', () => {
    const first = elementOf('erstes');
    const second = elementOf('zweites');

    service.replaceIds([{ element: first }, { element: second }]);

    expect(first.id).not.toBe('Text_1');
    expect(second.id).toBe('text_1');
  });

  /* The validator compares variable ids, a GeoGebra variable's `<element id>_<name>` included; the replacement has
     to see the same collision, or the button it offers would do nothing. */
  it('should replace an id that collides only with a GeoGebra variable id', () => {
    const geometry = new GeometryElement({ type: 'geometry', id: 'geo', alias: 'ggb' });
    geometry.trackedVariables = [{ id: 'A', value: '' }];
    const field = new TextFieldElement({ type: 'text-field', id: 'geo_A', alias: 'feld' });
    service.unit.pages[0].sections[0].elements.push(...[geometry, field] as unknown as PositionedUIElement[]);

    service.replaceIds([{ element: field }]);

    expect(field.id).not.toBe('geo_A');
  });

  it('should report nothing to the host when no id needed replacing', () => {
    veronaApiServiceSpy.sendChanged.mockClear();

    service.replaceIds([{ element: elementOf('zweite') }]);

    expect(elementOf('zweite').id).toBe('drop-list_2');
    expect(veronaApiServiceSpy.sendChanged).not.toHaveBeenCalled();
  });

  it('should carry a button that sets the state variable along', () => {
    const button = new ButtonElement({
      type: 'button',
      id: 'button_1',
      alias: 'knopf',
      action: 'stateVariableChange',
      actionParam: new StateVariable('März', 'maerz', '1')
    });
    service.unit.pages[0].sections[0].elements.push(button as unknown as PositionedUIElement);
    const [stateVariable] = service.unit.stateVariables;

    service.replaceIds([{ stateVariable }]);

    expect((button.actionParam as StateVariable).id).toBe(stateVariable.id);
  });

  /* The applet hangs under the element id in the page, which the template renames on its next check. */
  it('should re-inject a geometry applet only after the id is in the page', fakeAsync(() => {
    const geometry = new GeometryElement({ type: 'geometry', id: 'Geo 1', alias: 'geo' });
    service.unit.pages[0].sections[0].elements.push(geometry as unknown as PositionedUIElement);
    const reinjected = vi.fn();
    service.geometryElementPropertyUpdated.subscribe(reinjected);

    service.replaceIds([{ element: geometry }]);
    expect(reinjected).not.toHaveBeenCalled();
    tick();

    expect(reinjected).toHaveBeenCalledWith(geometry.id);
  }));
});

/* Stored units can hold a state variable and an element with exactly the same id. */
describe('UnitService - replacing an id that has an exact twin (#1508)', () => {
  it('should keep the registration and follow only the references that cannot mean the twin', () => {
    const translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    const idService = new IDService();
    const service = new UnitService(new SelectionService(), createSpyObj<VeronaAPIService>(['sendChanged']),
                                    createSpyObj<MessageService>(['showFixedReferencePanel', 'showPrompt']),
                                    createSpyObj<DialogService>(['showVariableInfoFindingsDialog']),
                                    idService, translateServiceSpy);
    const blueprint = createUnitBlueprint('unused');
    blueprint.stateVariables = [new StateVariable('Wert', 'zustand', '')];
    blueprint.pages[0].sections[0].elements.push({
      type: 'text-field',
      id: 'Wert',
      alias: 'feld',
      position: {
        gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
      }
    } as unknown as PositionedUIElement);
    blueprint.pages[0].sections[0].visibilityRules = [{ id: 'Wert', operator: '=', value: '1' }];
    service.loadUnitDefinition(JSON.stringify(blueprint));
    const [stateVariable] = service.unit.stateVariables;

    service.replaceIds([{ stateVariable }]);

    expect(stateVariable.id).not.toBe('Wert');
    expect(idService.isIDAvailable('Wert')).toBe(false);
    // A visibility rule could ask either; nothing tells them apart, so it stays with the element.
    expect(service.unit.pages[0].sections[0].visibilityRules[0].id).toBe('Wert');
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
      new DialogService({ open: dialogOpen } as unknown as MatDialog,
                        createSpyObj<MessageService>(['showError']), translateServiceSpy),
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
      } as unknown as MatDialog, createSpyObj<MessageService>(['showError']), translateServiceSpy),
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
