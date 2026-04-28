import { fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { StateVariable } from 'common/models/state-variable';
import { VersionManager } from 'common/services/version-manager';
import { AppComponent } from './app.component';
import { IDService } from './services/id.service';
import { DialogService } from './services/dialog.service';
import { MessageService } from './services/message.service';
import { SelectionService } from './services/selection.service';
import { UnitService } from './services/unit-services/unit.service';
import { StartCommand, VeronaAPIService } from './services/verona-api.service';

describe('AppComponent startCommand loading', () => {
  let startCommand$: Subject<StartCommand>;
  let unitService: UnitService;
  let veronaApiServiceMock: Pick<VeronaAPIService, 'startCommand' | 'sendReady' | 'sendChanged'>;
  let translateServiceMock: Pick<TranslateService, 'addLangs' | 'setDefaultLang'>;
  const expectJasmine = globalThis.expect as unknown as {
    (actual: unknown): jasmine.Matchers<unknown>;
    (actual: () => unknown): jasmine.FunctionMatchers<() => unknown>;
  };

  beforeEach(() => {
    startCommand$ = new Subject<StartCommand>();

    const selectionService = new SelectionService();
    const idService = new IDService();
    const messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', [
      'showFixedReferencePanel',
      'showReferencePanel'
    ]);
    const dialogServiceSpy = jasmine.createSpyObj<DialogService>('DialogService', [
      'showUnitDefErrorDialog',
      'showDeleteConfirmDialog'
    ]);

    veronaApiServiceMock = {
      startCommand: startCommand$,
      sendReady: jasmine.createSpy('sendReady'),
      sendChanged: jasmine.createSpy('sendChanged')
    };

    unitService = new UnitService(
      selectionService,
      veronaApiServiceMock as VeronaAPIService,
      messageServiceSpy,
      dialogServiceSpy,
      idService
    );

    translateServiceMock = {
      addLangs: jasmine.createSpy('addLangs'),
      setDefaultLang: jasmine.createSpy('setDefaultLang')
    };
  });

  it('loads a single non-likert startCommand', fakeAsync(() => {
    const appComponent = new AppComponent(
      unitService,
      translateServiceMock as TranslateService,
      veronaApiServiceMock as VeronaAPIService
    );

    appComponent.ngOnInit();

    startCommand$.next(createStartCommand('first', 'Checkbox A'));
    tick();

    if ((veronaApiServiceMock.sendReady as jasmine.Spy).calls.count() !== 1) {
      throw new Error('Expected sendReady to be called once');
    }
    if (unitService.unit.getAllElements('checkbox').length !== 1) {
      throw new Error('Expected exactly one checkbox element after the first StartCommand');
    }
    if (unitService.unit.stateVariables[0].id !== 'first') {
      throw new Error('Expected the first StartCommand unit to stay loaded');
    }
    expectJasmine(1).toBe(1);
  }));

  it('loads only the latest unit when two different startCommands arrive back-to-back', fakeAsync(() => {
    spyOn(Date, 'now').and.returnValue(1710000000000);

    const appComponent = new AppComponent(
      unitService,
      translateServiceMock as TranslateService,
      veronaApiServiceMock as VeronaAPIService
    );

    appComponent.ngOnInit();

    startCommand$.next(createLikertStartCommand('first', 'Likert A'));
    startCommand$.next(createStartCommand('second', 'Checkbox B'));

    expectJasmine(() => tick()).not.toThrow();
    expectJasmine(unitService.unit.stateVariables[0].id).toBe('second');
    expectJasmine(unitService.unit.getAllElements('checkbox').length).toBe(1);
    expectJasmine((veronaApiServiceMock.sendReady as jasmine.Spy).calls.count()).toBe(1);
  }));

  it('loads only the latest unit when two checkbox startCommands arrive back-to-back', fakeAsync(() => {
    spyOn(Date, 'now').and.returnValue(1710000000001);

    const appComponent = new AppComponent(
      unitService,
      translateServiceMock as TranslateService,
      veronaApiServiceMock as VeronaAPIService
    );

    appComponent.ngOnInit();

    startCommand$.next(createStartCommand('first-checkbox', 'Checkbox First'));
    startCommand$.next(createStartCommand('second-checkbox', 'Checkbox Second'));

    expectJasmine(() => tick()).not.toThrow();
    expectJasmine(unitService.unit.stateVariables[0].id).toBe('second-checkbox');
    expectJasmine(unitService.unit.getAllElements('checkbox').length).toBe(1);
    expectJasmine((veronaApiServiceMock.sendReady as jasmine.Spy).calls.count()).toBe(1);
  }));
});

function createStartCommand(marker: string, label: string): StartCommand {
  return {
    type: 'voeStartCommand',
    sessionId: `session-${marker}`,
    unitDefinition: JSON.stringify(createCheckboxUnitBlueprint(marker, label)),
    unitDefinitionType: 'aspect-unit-definition',
    editorConfig: {
      directDownloadUrl: 'assets',
      role: 'maintainer'
    }
  } as StartCommand;
}

function createLikertStartCommand(marker: string, label: string): StartCommand {
  return {
    type: 'voeStartCommand',
    sessionId: `session-${marker}`,
    unitDefinition: JSON.stringify(createLikertUnitBlueprint(marker, label)),
    unitDefinitionType: 'aspect-unit-definition',
    editorConfig: {
      directDownloadUrl: 'assets',
      role: 'maintainer'
    }
  } as StartCommand;
}

function createCheckboxUnitBlueprint(marker: string, label: string) {
  return {
    type: 'aspect-unit-definition',
    version: VersionManager.getCurrentVersion(),
    stateVariables: [new StateVariable(marker, marker, marker)],
    pages: [
      {
        sections: [
          {
            elements: [
              {
                type: 'checkbox',
                label,
                imgSrc: null,
                value: false,
                crossOutChecked: false,
                position: {
                  xPosition: null,
                  yPosition: null,
                  gridColumn: null,
                  gridColumnRange: null,
                  gridRow: null,
                  gridRowRange: null,
                  marginLeft: { value: 0, unit: 'px' },
                  marginRight: { value: 0, unit: 'px' },
                  marginTop: { value: 0, unit: 'px' },
                  marginBottom: { value: 0, unit: 'px' },
                  zIndex: 0
                },
                dimensions: {
                  width: null,
                  height: null,
                  isWidthFixed: false,
                  isHeightFixed: false,
                  minWidth: null,
                  maxWidth: null,
                  minHeight: null,
                  maxHeight: null
                },
                styling: {
                  backgroundColor: '#ffffff',
                  borderColor: '#000000',
                  borderWidth: 0,
                  borderStyle: 'solid',
                  fontColor: '#000000',
                  font: 'Arial',
                  fontSize: 12,
                  bold: false,
                  italic: false,
                  underline: false
                },
                isRelevantForPresentationComplete: true,
                readOnly: false,
                required: false,
                requiredWarnMessage: 'Eingabe erforderlich'
              }
            ],
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

function createLikertUnitBlueprint(marker: string, label: string) {
  return {
    type: 'aspect-unit-definition',
    version: VersionManager.getCurrentVersion(),
    stateVariables: [new StateVariable(marker, marker, marker)],
    pages: [
      {
        sections: [
          {
            elements: [
              {
                type: 'likert',
                options: [
                  {
                    text: 'A', imgSrc: null, imgFileName: '', imgPosition: 'above'
                  },
                  {
                    text: 'B', imgSrc: null, imgFileName: '', imgPosition: 'above'
                  }
                ],
                rows: [
                  {
                    type: 'likert-row',
                    rowLabel: {
                      text: label, imgSrc: null, imgFileName: '', imgPosition: 'above'
                    },
                    columnCount: 2,
                    firstColumnSizeRatio: 3,
                    verticalButtonAlignment: 'center'
                  },
                  {
                    type: 'likert-row',
                    rowLabel: {
                      text: `${label}-2`, imgSrc: null, imgFileName: '', imgPosition: 'above'
                    },
                    columnCount: 2,
                    firstColumnSizeRatio: 3,
                    verticalButtonAlignment: 'center'
                  }
                ],
                label: 'Question',
                label2: '',
                stickyHeader: true,
                firstColumnSizeRatio: 3
              }
            ],
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
