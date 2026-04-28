import { VersionManager } from 'common/services/version-manager';
import { UnitProperties } from 'common/models/unit';
import { StateVariable } from 'common/models/state-variable';
import { MessageService } from 'editor/src/app/services/message.service';
import { DialogService } from './dialog.service';
import { SelectionService } from './selection.service';
import { IDService } from './id.service';
import { VeronaAPIService } from './verona-api.service';
import { UnitService } from './unit.service';

describe('UnitService - rapid load handling', () => {
  let service: UnitService;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    const selectionService = new SelectionService();
    const idService = new IDService();
    const veronaApiServiceSpy = jasmine.createSpyObj<VeronaAPIService>('VeronaAPIService', ['sendChanged']);
    const messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', [
      'showFixedReferencePanel',
      'showReferencePanel'
    ]);

    dialogServiceSpy = jasmine.createSpyObj<DialogService>('DialogService', [
      'showUnitDefErrorDialog',
      'showDeleteConfirmDialog'
    ]);

    service = new UnitService(
      selectionService,
      veronaApiServiceSpy,
      messageServiceSpy,
      dialogServiceSpy,
      idService
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
