import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { SplitPipe } from 'common/pipes/split.pipe';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-group-elements/widget-periodic-table';
import { WidgetPeriodicTableComponent } from './widget-periodic-table.component';

describe('WidgetPeriodicTableComponent', () => {
  let component: WidgetPeriodicTableComponent;
  let fixture: ComponentFixture<WidgetPeriodicTableComponent>;

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [WidgetPeriodicTableComponent, SplitPipe],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetPeriodicTableComponent);
    component = fixture.componentInstance;
    component.elementModel = new WidgetPeriodicTableElement({
      id: 'test-id',
      alias: 'test-alias',
      type: 'widget-periodic-table'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit widgetCallEvent with parameters when emitWidgetCall is called', () => {
    vi.spyOn(component.widgetCallEvent, 'emit');

    component.elementModel.showInfoOrder = true;
    component.elementModel.showInfoENeg = false;
    component.elementModel.showInfoAMass = true;
    component.elementModel.closeOnSelection = false;
    component.elementModel.maxNumberOfSelections = 3;

    component.emitWidgetCall();

    expect(component.widgetCallEvent.emit).toHaveBeenCalledWith({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      closeOnSelection: false,
      maxNumberOfSelections: 3
    });
  });
});
