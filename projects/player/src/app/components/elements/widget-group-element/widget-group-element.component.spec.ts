// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { WidgetPeriodicTableCall } from 'common/models/widget-interfaces';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { WidgetGroupElementComponent } from './widget-group-element.component';

describe('WidgetGroupElementComponent', () => {
  let component: WidgetGroupElementComponent;
  let fixture: ComponentFixture<WidgetGroupElementComponent>;

  @Component({
    selector: 'aspect-widget-periodic-table',
    template: '',
    standalone: false
  })
  class WidgetPeriodicTableStubComponent {
    @Input() elementModel!: WidgetPeriodicTableElement;
  }

  class MockVeronaSubscriptionService {
    vopWidgetReturn = new Subject<{ state?: string, sessionId: string, callId?: string, type: 'vopWidgetReturn' }>();
  }

  const periodicTableCall: WidgetPeriodicTableCall = {
    parameters: {
      showInfoOrder: true,
      showInfoName: false,
      showInfoSymbol: true,
      showInfoENeg: false,
      showInfoAMass: true,
      showInfoLabels: false,
      highlightBlocks: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    },
    sharedParameters: { textColor: '#000000', backgroundColor: '#abcdef' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WidgetPeriodicTableStubComponent,
        WidgetGroupElementComponent,
        CastPipe
      ],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: VeronaSubscriptionService, useClass: MockVeronaSubscriptionService }
      ]
    })
      .compileComponents();
    TestBed.inject(TranslateService).setDefaultLang('de');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new WidgetPeriodicTableElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call sendVopWidgetCall with mapped parameters when applyWidgetCall is triggered', () => {
    const veronaPostService = TestBed.inject(VeronaPostService);
    vi.spyOn(veronaPostService, 'sendVopWidgetCall');

    component.applyWidgetCall(periodicTableCall, 'PERIODIC_TABLE');

    expect(veronaPostService.sendVopWidgetCall).toHaveBeenCalledWith(expect.objectContaining({
      callId: expect.any(String),
      widgetType: 'PERIODIC_TABLE',
      parameters: [
        { key: 'SHOW_INFO_ORDER', value: 'true' },
        { key: 'SHOW_INFO_NAME', value: 'false' },
        { key: 'SHOW_INFO_SYMBOL', value: 'true' },
        { key: 'SHOW_INFO_E_NEG', value: 'false' },
        { key: 'SHOW_INFO_A_MASS', value: 'true' },
        { key: 'SHOW_INFO_LABELS', value: 'false' },
        { key: 'HIGHLIGHT_BLOCKS', value: 'true' },
        { key: 'CLOSE_ON_SELECTION', value: 'true' },
        { key: 'MAX_NUMBER_OF_SELECTIONS', value: '3' },
        { key: 'LANGUAGE', value: 'de' }
      ],
      sharedParameters: [
        { key: 'TEXT_COLOR', value: '#000000' },
        { key: 'BACKGROUND_COLOR', value: '#abcdef' }
      ]
    }));
  });

  /* The widget takes the language of the player, whatever it is, rather than one stored in the task
     (#1420). */
  it('should send the language the player runs in', () => {
    const veronaPostService = TestBed.inject(VeronaPostService);
    vi.spyOn(veronaPostService, 'sendVopWidgetCall');
    TestBed.inject(TranslateService).use('en');

    component.applyWidgetCall(periodicTableCall, 'PERIODIC_TABLE');

    expect(vi.mocked(veronaPostService.sendVopWidgetCall).mock.lastCall?.[0].parameters)
      .toContainEqual({ key: 'LANGUAGE', value: 'en' });
  });

  it('should update elementModel state and call changeElementCodeValue on vopWidgetReturn', () => {
    const veronaSubscriptionService = TestBed.inject(VeronaSubscriptionService);
    const veronaPostService = TestBed.inject(VeronaPostService);
    const sendVopWidgetCallSpy = vi.spyOn(veronaPostService, 'sendVopWidgetCall');
    vi.spyOn(component, 'changeElementCodeValue');

    component.applyWidgetCall(periodicTableCall, 'PERIODIC_TABLE');

    const lastWidgetCall = sendVopWidgetCallSpy.mock.lastCall;
    if (!lastWidgetCall) throw new Error('sendVopWidgetCall was not called');
    const sentCallId = lastWidgetCall[0].callId;
    const mockReturnEvent = {
      type: 'vopWidgetReturn' as const, sessionId: '1', callId: sentCallId, state: 'newState'
    };
    (veronaSubscriptionService as unknown as MockVeronaSubscriptionService).vopWidgetReturn.next(mockReturnEvent);

    expect((component.elementModel as WidgetPeriodicTableElement).state).toEqual('newState');
    expect(component.changeElementCodeValue).toHaveBeenCalledWith({ id: 'id', value: 'newState' });
  });

  it('should ignore vopWidgetReturn messages with a non-matching callId', () => {
    const veronaSubscriptionService = TestBed.inject(VeronaSubscriptionService);
    vi.spyOn(component, 'changeElementCodeValue');

    component.applyWidgetCall(periodicTableCall, 'PERIODIC_TABLE');

    const mockReturnEvent = {
      type: 'vopWidgetReturn' as const, sessionId: '1', callId: 'other-widget-call', state: 'base64FromOtherWidget'
    };
    (veronaSubscriptionService as unknown as MockVeronaSubscriptionService).vopWidgetReturn.next(mockReturnEvent);

    expect((component.elementModel as WidgetPeriodicTableElement).state).toBeNull();
    expect(component.changeElementCodeValue).not.toHaveBeenCalled();
  });

  describe('a return that clears or keeps the answer (#1465)', () => {
    const returnFromWidget = (state?: string | null): void => {
      const veronaSubscriptionService = TestBed.inject(VeronaSubscriptionService);
      const sendVopWidgetCallSpy = vi.spyOn(TestBed.inject(VeronaPostService), 'sendVopWidgetCall');
      component.applyWidgetCall(periodicTableCall, 'PERIODIC_TABLE');
      const callId = sendVopWidgetCallSpy.mock.lastCall?.[0].callId;
      /* The message comes in by postMessage, so a `null` the type rules out can still arrive. */
      (veronaSubscriptionService as unknown as MockVeronaSubscriptionService).vopWidgetReturn.next({
        type: 'vopWidgetReturn', sessionId: '1', callId, ...(state !== undefined ? { state: state as string } : {})
      });
    };

    beforeEach(() => {
      (component.elementModel as WidgetPeriodicTableElement).state = 'Na Cl';
      vi.spyOn(component, 'changeElementCodeValue');
    });

    /* The periodic table sends '' once every symbol is deselected. That is the answer the unit state
       has to report, as a changed value -- '' and not null, which is why the variable is not nullable. */
    it('should take an empty state as the new answer', () => {
      returnFromWidget('');

      expect((component.elementModel as WidgetPeriodicTableElement).state).toBe('');
      expect(TestBed.inject(UnitStateService).getElementCodeById('id'))
        .toEqual(expect.objectContaining({ value: '', status: 'VALUE_CHANGED' }));
    });

    it('should leave the answer as it was when the return carries no state', () => {
      returnFromWidget();

      expect((component.elementModel as WidgetPeriodicTableElement).state).toBe('Na Cl');
      expect(component.changeElementCodeValue).not.toHaveBeenCalled();
    });

    it('should leave the answer as it was when the return carries null', () => {
      returnFromWidget(null);

      expect((component.elementModel as WidgetPeriodicTableElement).state).toBe('Na Cl');
      expect(component.changeElementCodeValue).not.toHaveBeenCalled();
    });

    it('should keep an unanswered widget unanswered when it is confirmed without a choice', () => {
      (component.elementModel as WidgetPeriodicTableElement).state = null;

      returnFromWidget('');

      expect((component.elementModel as WidgetPeriodicTableElement).state).toBeNull();
      expect(component.changeElementCodeValue).not.toHaveBeenCalled();
    });
  });
});
