import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  UnitDefErrorDialogComponent
} from 'common/components/unit-def-error-dialog/unit-def-error-dialog.component';
import { VersionManager } from 'common/services/version-manager';
import { SectionCounter } from 'common/utils/section-counter';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  NavigationTarget, VopPlayerConfigChangedNotification, VopStartCommand
} from 'player/modules/verona/models/verona';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { MetaDataService } from 'player/src/app/services/meta-data.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { UnitComponent } from './unit.component';

describe('UnitComponent', () => {
  let component: UnitComponent;
  let fixture: ComponentFixture<UnitComponent>;
  let vopStartCommand: Subject<VopStartCommand>;
  let vopPlayerConfigChangedNotification: Subject<VopPlayerConfigChangedNotification>;
  let veronaPostService: VeronaPostService;
  let metaDataService: MetaDataService;
  let navigationService: SpyObj<NavigationService> & {
    enabledNavigationTargets: BehaviorSubject<NavigationTarget[] | undefined>;
  };
  let unitStateService: SpyObj<UnitStateService>;
  let stateVariableStateService: SpyObj<StateVariableStateService>;
  let anchorService: SpyObj<AnchorService>;
  let dialog: MatDialog;

  const createUnitDefinition = (properties: Record<string, unknown> = {}): string => JSON.stringify({
    type: 'aspect-unit-definition',
    version: VersionManager.getCurrentVersion(),
    stateVariables: [],
    pages: [],
    enableSectionNumbering: false,
    sectionNumberingPosition: 'left',
    showUnitNavNext: false,
    ...properties
  });

  const sendStartCommand = (message: Partial<VopStartCommand>): void => {
    vopStartCommand.next({
      type: 'vopStartCommand',
      sessionId: 'session_1',
      unitDefinition: createUnitDefinition(),
      playerConfig: {},
      ...message
    } as VopStartCommand);
  };

  const startUnit = (message: Partial<VopStartCommand>): void => {
    sendStartCommand(message);
    tick();
  };

  beforeEach(async () => {
    vopStartCommand = new Subject<VopStartCommand>();
    vopPlayerConfigChangedNotification = new Subject<VopPlayerConfigChangedNotification>();
    navigationService = Object.assign(
      createSpyObj<NavigationService>(['setPage']),
      { enabledNavigationTargets: new BehaviorSubject<NavigationTarget[] | undefined>(undefined) }
    );
    unitStateService = createSpyObj<UnitStateService>(['setElementCodes']);
    stateVariableStateService = createSpyObj<StateVariableStateService>(['setElementCodes', 'registerElementCode']);
    anchorService = createSpyObj<AnchorService>(['reset']);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      declarations: [UnitComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: VeronaSubscriptionService,
          useValue: {
            vopStartCommand: vopStartCommand.asObservable(),
            vopPlayerConfigChangedNotification: vopPlayerConfigChangedNotification.asObservable()
          }
        },
        { provide: NavigationService, useValue: navigationService },
        { provide: UnitStateService, useValue: unitStateService },
        { provide: StateVariableStateService, useValue: stateVariableStateService },
        { provide: AnchorService, useValue: anchorService }
      ]
    }).compileComponents();

    veronaPostService = TestBed.inject(VeronaPostService);
    metaDataService = TestBed.inject(MetaDataService);
    dialog = TestBed.inject(MatDialog);
  });

  beforeEach(() => {
    SectionCounter.reset();
    fixture = TestBed.createComponent(UnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should take over the pages of a started unit', fakeAsync(() => {
    startUnit({ unitDefinition: createUnitDefinition({ pages: [{ sections: [] }, { sections: [] }] }) });

    expect(component.pages.length).toBe(2);
  }));

  it('should take over the player config of a started unit', fakeAsync(() => {
    startUnit({ playerConfig: { pagingMode: 'buttons', enabledNavigationTargets: ['next'] } });

    expect(component.playerConfig.pagingMode).toBe('buttons');
    expect(navigationService.enabledNavigationTargets.value).toEqual(['next']);
  }));

  it('should take over the session id of a started unit', fakeAsync(() => {
    startUnit({ sessionId: 'session_42' });

    expect(veronaPostService.sessionID).toBe('session_42');
  }));

  it('should take over the download url as resource url', fakeAsync(() => {
    startUnit({ playerConfig: { directDownloadUrl: 'https://example.org/resources' } });

    expect(metaDataService.resourceURL).toBe('https://example.org/resources');
  }));

  it('should take over the section numbering of a started unit', fakeAsync(() => {
    startUnit({
      unitDefinition: createUnitDefinition({
        enableSectionNumbering: true, sectionNumberingPosition: 'above'
      })
    });

    expect(component.sectionNumbering).toEqual({
      enableSectionNumbering: true, sectionNumberingPosition: 'above'
    });
  }));

  it('should take over the unit navigation setting of a started unit', fakeAsync(() => {
    startUnit({ unitDefinition: createUnitDefinition({ showUnitNavNext: true }) });

    expect(component.showUnitNavNext).toBe(true);
  }));

  it('should hand the stored element codes over to the unit state service', fakeAsync(() => {
    startUnit({
      unitState: {
        dataParts: {
          elementCodes: JSON.stringify([{ id: 'alias_1', status: 'VALUE_CHANGED', value: 'a' }])
        }
      }
    } as Partial<VopStartCommand>);

    expect(unitStateService.setElementCodes)
      .toHaveBeenCalledWith([{ id: 'alias_1', status: 'VALUE_CHANGED', value: 'a' }], []);
  }));

  it('should start without element codes when the unit state is empty', fakeAsync(() => {
    startUnit({});

    expect(unitStateService.setElementCodes).toHaveBeenCalledWith([], []);
  }));

  it('should register the state variables of a started unit', fakeAsync(() => {
    startUnit({
      unitDefinition: createUnitDefinition({
        stateVariables: [{ id: 'state_1', alias: 'state_1', value: '0' }]
      })
    });

    expect(stateVariableStateService.registerElementCode)
      .toHaveBeenCalledWith('state_1', 'state_1', '0');
  }));

  it('should navigate to the configured start page', fakeAsync(() => {
    startUnit({ playerConfig: { startPage: '2' } });
    tick(10);

    expect(navigationService.setPage).toHaveBeenCalledWith(2);
  }));

  it('should not navigate without a configured start page', fakeAsync(() => {
    startUnit({});
    tick(10);

    expect(navigationService.setPage).not.toHaveBeenCalled();
  }));

  it('should reset the unit before a new one is started', fakeAsync(() => {
    startUnit({ unitDefinition: createUnitDefinition({ pages: [{ sections: [] }] }) });
    expect(component.pages.length).toBe(1);

    startUnit({ unitDefinition: createUnitDefinition({ pages: [] }) });

    expect(component.pages.length).toBe(0);
    expect(anchorService.reset).toHaveBeenCalled();
    expect(component.presentationProgressStatus.value).toBe('none');
  }));

  it('should build only the last of two start commands that arrive in quick succession', fakeAsync(() => {
    sendStartCommand({
      sessionId: 'session_1',
      unitDefinition: createUnitDefinition({ pages: [{ sections: [] }] })
    });
    sendStartCommand({
      sessionId: 'session_2',
      unitDefinition: createUnitDefinition({ pages: [{ sections: [] }, { sections: [] }] })
    });
    tick();

    expect(component.pages.length).toBe(2);
    expect(veronaPostService.sessionID).toBe('session_2');
    expect(unitStateService.setElementCodes).toHaveBeenCalledTimes(1);
  }));

  it('should not build a unit after the component was destroyed', fakeAsync(() => {
    sendStartCommand({ unitDefinition: createUnitDefinition({ pages: [{ sections: [] }] }) });
    fixture.destroy();
    tick();

    expect(component.pages.length).toBe(0);
  }));

  it('should show an error dialog for an unreadable unit definition', fakeAsync(() => {
    const open = vi.spyOn(dialog, 'open');

    startUnit({ unitDefinition: 'no json' });

    expect(open).toHaveBeenCalledWith(UnitDefErrorDialogComponent, expect.objectContaining({
      disableClose: true
    }));
  }));

  it('should show an error dialog for a newer unit definition', fakeAsync(() => {
    const open = vi.spyOn(dialog, 'open');

    startUnit({ unitDefinition: createUnitDefinition({ version: '99.0.0' }) });

    expect(open).toHaveBeenCalled();
  }));

  it('should show an error dialog for an outdated unit definition', fakeAsync(() => {
    const open = vi.spyOn(dialog, 'open');

    startUnit({ unitDefinition: createUnitDefinition({ version: '1.0.0' }) });

    expect(open).toHaveBeenCalled();
  }));

  it('should keep the pages of a message without unit definition', fakeAsync(() => {
    startUnit({ unitDefinition: createUnitDefinition({ pages: [{ sections: [] }] }) });

    startUnit({ unitDefinition: undefined });

    expect(component.pages.length).toBe(0);
    expect(component.playerConfig).toEqual({});
  }));

  it('should ignore verona messages after the component was destroyed', fakeAsync(() => {
    fixture.destroy();

    startUnit({ unitDefinition: createUnitDefinition({ pages: [{ sections: [] }] }) });
    vopPlayerConfigChangedNotification.next({
      type: 'vopPlayerConfigChangedNotification',
      sessionId: 'session_1',
      playerConfig: { pagingMode: 'concat-scroll' }
    } as VopPlayerConfigChangedNotification);

    expect(component.pages.length).toBe(0);
    expect(component.playerConfig).toEqual({});
  }));

  it('should take over a changed player config', () => {
    vopPlayerConfigChangedNotification.next({
      type: 'vopPlayerConfigChangedNotification',
      sessionId: 'session_1',
      playerConfig: { pagingMode: 'concat-scroll', enabledNavigationTargets: ['previous'] }
    } as VopPlayerConfigChangedNotification);

    expect(component.playerConfig.pagingMode).toBe('concat-scroll');
    expect(navigationService.enabledNavigationTargets.value).toEqual(['previous']);
  });
});
