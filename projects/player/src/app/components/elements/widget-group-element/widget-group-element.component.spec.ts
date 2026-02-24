// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { WidgetPeriodicTableElement } from 'common/models/elements/widgets/widget-periodic-table';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
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
    vopWidgetReturn = new Subject<{ state: string, sessionId: string, type: 'vopWidgetReturn' }>();
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

  it('should call sendVopWidgetCall with mapped parameters when applyWidgetPeriodicTableCall is triggered', () => {
    const veronaPostService = TestBed.inject(VeronaPostService);
    spyOn(veronaPostService, 'sendVopWidgetCall');

    component.applyWidgetPeriodicTableCall({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    });

    expect(veronaPostService.sendVopWidgetCall).toHaveBeenCalledWith({
      widgetType: 'periodic_table',
      parameters: [
        { key: 'SHOW_INFO_ORDER', value: 'true' },
        { key: 'SHOW_INFO_E_NEG', value: 'false' },
        { key: 'SHOW_INFO_A_MASS', value: 'true' },
        { key: 'CLOSE_ON_SELECTION', value: 'true' },
        { key: 'MAX_NUMBER_OF_SELECTIONS', value: '3' }
      ]
    });
  });

  it('should update elementModel state and call changeElementCodeValue on vopWidgetReturn', () => {
    const veronaSubscriptionService = TestBed.inject(VeronaSubscriptionService);
    spyOn(component, 'changeElementCodeValue');

    component.applyWidgetPeriodicTableCall({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    });

    const mockReturnEvent = { type: 'vopWidgetReturn' as const, sessionId: '1', state: 'newState' };
    (veronaSubscriptionService as unknown as MockVeronaSubscriptionService).vopWidgetReturn.next(mockReturnEvent);

    expect((component.elementModel as WidgetPeriodicTableElement).state).toEqual('newState');
    expect(component.changeElementCodeValue).toHaveBeenCalledWith({ id: 'id', value: 'newState' });
  });
});
