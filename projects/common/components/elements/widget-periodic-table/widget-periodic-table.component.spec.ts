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

  /* The answer next to the button looks like the selection in the widget: white on its purple, or a
     neutral dark grey when the widget colours the fields by block (#1369). */
  describe('the selected elements', () => {
    const squares = (): HTMLElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('.element-square') as NodeListOf<HTMLElement>
    );

    it('should show each symbol white and bold on the widget\'s purple', () => {
      component.elementModel.state = 'H He';
      fixture.detectChanges();

      expect(squares().map(square => square.textContent?.trim())).toEqual(['H', 'He']);
      const style = getComputedStyle(squares()[0]);
      expect(style.backgroundColor).toBe('rgb(107, 54, 154)');
      expect(style.color).toBe('rgb(255, 255, 255)');
      expect(style.fontWeight).toBe('700');
      expect(style.fontSize).toBe('21px');
    });

    it('should show them dark grey when the fields are coloured by block', () => {
      component.elementModel.state = 'H He';
      component.elementModel.highlightBlocks = true;
      fixture.detectChanges();

      expect(getComputedStyle(squares()[0]).backgroundColor).toBe('rgb(66, 66, 66)');
      expect(getComputedStyle(squares()[0]).color).toBe('rgb(255, 255, 255)');
    });
  });

  it('should emit widgetCallEvent with parameters when emitWidgetCall is called', () => {
    vi.spyOn(component.widgetCallEvent, 'emit');

    component.elementModel.showInfoOrder = true;
    component.elementModel.showInfoENeg = false;
    component.elementModel.showInfoAMass = true;
    component.elementModel.showInfoName = false;
    component.elementModel.showInfoSymbol = true;
    component.elementModel.highlightBlocks = true;
    component.elementModel.closeOnSelection = false;
    component.elementModel.maxNumberOfSelections = 3;

    component.emitWidgetCall();

    expect(component.widgetCallEvent.emit).toHaveBeenCalledWith({
      showInfoOrder: true,
      showInfoENeg: false,
      showInfoAMass: true,
      showInfoName: false,
      showInfoSymbol: true,
      highlightBlocks: true,
      closeOnSelection: false,
      maxNumberOfSelections: 3
    });
  });
});
