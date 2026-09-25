// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WidgetPeriodicTableStubComponent,
        WidgetGroupElementComponent,
        CastPipe
      ],
      providers: [
        { provide: VeronaSubscriptionService, useClass: MockVeronaSubscriptionService }
      ]
    })
      .compileComponents();
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

    component.applyWidgetCall({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    }, 'PERIODIC_TABLE');

    expect(veronaPostService.sendVopWidgetCall).toHaveBeenCalledWith(expect.objectContaining({
      callId: expect.any(String),
      widgetType: 'PERIODIC_TABLE',
      parameters: [
        { key: 'SHOW_INFO_ORDER', value: '1' },
        { key: 'SHOW_INFO_E_NEG', value: '0' },
        { key: 'SHOW_INFO_A_MASS', value: '1' },
        { key: 'CLOSE_ON_SELECTION', value: '1' },
        { key: 'MAX_NUMBER_OF_SELECTIONS', value: '3' }
      ]
    }));
  });

  it('should send the bonding type as a call parameter and nothing besides', () => {
    const veronaPostService = TestBed.inject(VeronaPostService);
    vi.spyOn(veronaPostService, 'sendVopWidgetCall');

    component.applyWidgetCall({ bondingType: 'ELECTRONS' }, 'MOLECULE_EDITOR');

    expect(veronaPostService.sendVopWidgetCall).toHaveBeenCalledWith({
      callId: expect.any(String),
      widgetType: 'MOLECULE_EDITOR',
      parameters: [{ key: 'BONDING_TYPE', value: 'ELECTRONS' }]
    });
  });

  it('should update elementModel state and call changeElementCodeValue on vopWidgetReturn', () => {
    const veronaSubscriptionService = TestBed.inject(VeronaSubscriptionService);
    const veronaPostService = TestBed.inject(VeronaPostService);
    const sendVopWidgetCallSpy = vi.spyOn(veronaPostService, 'sendVopWidgetCall');
    vi.spyOn(component, 'changeElementCodeValue');

    component.applyWidgetCall({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    }, 'PERIODIC_TABLE');

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

    component.applyWidgetCall({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    }, 'PERIODIC_TABLE');

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
      component.applyWidgetCall({
        showInfoOrder: true,
        showInfoENeg: false,
        showInfoAMass: true,
        closeOnSelection: false,
        maxNumberOfSelections: 3
      }, 'PERIODIC_TABLE');
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
