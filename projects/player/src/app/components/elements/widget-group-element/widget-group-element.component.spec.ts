// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { WidgetPeriodicTableElement } from 'common/models/elements/widgets/widget-periodic-table';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WidgetPeriodicTableStubComponent,
        WidgetGroupElementComponent,
        CastPipe
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

  it('should call sendVopWidgetCall with mapped parameters when applyWidgetCallEvent is triggered', () => {
    const veronaPostService = TestBed.inject(VeronaPostService);
    spyOn(veronaPostService, 'sendVopWidgetCall');

    component.applyWidgetCallEvent({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: true,
      maxNumberOfSelections: 3
    });

    expect(veronaPostService.sendVopWidgetCall).toHaveBeenCalledWith({
      widgetType: 'periodic_table',
      parameters: [
        { key: 'showInfoOrder', value: 'true' },
        { key: 'showInfoENeg', value: 'false' },
        { key: 'showInfoAMass', value: 'true' },
        { key: 'closeOnSelection', value: 'true' },
        { key: 'maxNumberOfSelections', value: '3' }
      ]
    });
  });
});
