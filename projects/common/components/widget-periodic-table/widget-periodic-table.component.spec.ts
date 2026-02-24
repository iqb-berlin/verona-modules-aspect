import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from 'common/environment';
import { WidgetPeriodicTableElement } from 'common/models/elements/widgets/widget-periodic-table';
import { WidgetPeriodicTableComponent } from './widget-periodic-table.component';

describe('WidgetPeriodicTableComponent', () => {
  let component: WidgetPeriodicTableComponent;
  let fixture: ComponentFixture<WidgetPeriodicTableComponent>;

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [WidgetPeriodicTableComponent]
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
    spyOn(component.widgetCallEvent, 'emit');

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
