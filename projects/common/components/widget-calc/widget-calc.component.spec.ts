import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { WidgetCalcElement } from 'common/models/elements/widget-calc/widget-calc';
import { WidgetCalcComponent } from './widget-calc.component';

describe('WidgetCalcComponent', () => {
  let component: WidgetCalcComponent;
  let fixture: ComponentFixture<WidgetCalcComponent>;

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [WidgetCalcComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetCalcComponent);
    component = fixture.componentInstance;
    component.elementModel = new WidgetCalcElement({
      id: 'test-id',
      alias: 'test-alias',
      type: 'widget-calc'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit widgetCallEvent with parameters when emitWidgetCall is called', () => {
    spyOn(component.widgetCallEvent, 'emit');

    component.elementModel.mode = 'SCIENTIFIC';
    component.elementModel.journalLines = 5;

    component.emitWidgetCall();

    expect(component.widgetCallEvent.emit).toHaveBeenCalledWith({
      mode: 'SCIENTIFIC',
      journalLines: 5
    });
  });
});
