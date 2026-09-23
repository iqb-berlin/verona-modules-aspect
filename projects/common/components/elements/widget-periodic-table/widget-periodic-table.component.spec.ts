import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { SplitPipe } from 'common/pipes/split.pipe';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';
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

  /* The widget reads the two colours as shared parameters and everything else as parameters; a key
     on the wrong side is ignored by the widget (#1420). */
  it('should emit every setting, the colours as shared parameters', () => {
    vi.spyOn(component.widgetCallEvent, 'emit');

    Object.assign(component.elementModel, {
      showInfoOrder: true,
      showInfoName: false,
      showInfoSymbol: true,
      showInfoENeg: false,
      showInfoAMass: true,
      showInfoLabels: false,
      highlightBlocks: true,
      fieldTextColor: '#000000',
      fieldBackgroundColor: '#abcdef',
      closeOnSelection: false,
      maxNumberOfSelections: 3
    });

    component.emitWidgetCall();

    expect(component.widgetCallEvent.emit).toHaveBeenCalledWith({
      parameters: {
        showInfoOrder: true,
        showInfoName: false,
        showInfoSymbol: true,
        showInfoENeg: false,
        showInfoAMass: true,
        showInfoLabels: false,
        highlightBlocks: true,
        closeOnSelection: false,
        maxNumberOfSelections: 3
      },
      sharedParameters: { textColor: '#000000', backgroundColor: '#abcdef' }
    });
  });

  /* The widget falls back to its own colours only for a missing key; an empty one it takes as given
     and draws the fields in a teal of its stylesheet (#1420). */
  it('should leave out a colour whose field was emptied', () => {
    vi.spyOn(component.widgetCallEvent, 'emit');
    component.elementModel.fieldTextColor = '#000000';
    component.elementModel.fieldBackgroundColor = '';

    component.emitWidgetCall();

    expect(vi.mocked(component.widgetCallEvent.emit).mock.lastCall?.[0]?.sharedParameters)
      .toEqual({ textColor: '#000000' });
  });
});
