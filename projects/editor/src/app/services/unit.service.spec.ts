import { VersionManager } from 'common/services/version-manager';
import { UnitProperties } from 'common/models/unit';
import { StateVariable } from 'common/models/state-variable';
import { MessageService } from 'editor/src/app/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { VariableInfo } from '@iqb/responses';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from './dialog.service';
import { SelectionService } from './selection.service';
import { IDService } from './id.service';
import { VeronaAPIService } from './verona-api.service';
import { UnitService } from './unit.service';

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
