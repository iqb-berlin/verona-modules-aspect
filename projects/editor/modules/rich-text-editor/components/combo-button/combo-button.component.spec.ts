import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ColorPickerValuePipe } from 'editor/modules/editor-shared/pipes/color-picker-value.pipe';
import { ComboButtonComponent } from './combo-button.component';

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('ComboButtonComponent', () => {
  let component: ComboButtonComponent;
  let fixture: ComponentFixture<ComboButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComboButtonComponent, MockMatTooltipDirective, ColorPickerValuePipe],
      imports: [MatButtonModule, MatIconModule, MatSelectModule, TranslateModule.forRoot()]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('de', {
      tooltipKey: 'Übersetzter Tooltip',
      small: 'klein',
      large: 'groß'
    });
    translateService.use('de');

    fixture = TestBed.createComponent(ComboButtonComponent);
    component = fixture.componentInstance;
    component.inputType = 'list';
    component.icon = 'format_size';
    component.tooltip = 'tooltipKey';
    component.availableValues = [{ value: '10', label: 'small' }, { value: '12', label: 'large' }];
    fixture.detectChanges();
  });

  const openOptions = (): HTMLElement[] => {
    fixture.nativeElement.querySelector('.mat-mdc-select-trigger').click();
    fixture.detectChanges();
    return Array.from(document.querySelectorAll<HTMLElement>('mat-option'));
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the icon', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toContain('format_size');
  });

  it('should translate the tooltip key', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective))
      .injector.get(MockMatTooltipDirective);
    expect(tooltip.matTooltip).toBe('Übersetzter Tooltip');
  });

  it('should show the translated labels instead of the values', () => {
    expect(openOptions().map(option => option.textContent?.trim())).toEqual(['klein', 'groß']);
  });

  it('should emit the value, not the label, when an option is clicked', () => {
    vi.spyOn(component.selectionChanged, 'emit');
    openOptions()[1].click();
    expect(component.selectionChanged.emit).toHaveBeenCalledWith('12');
  });

  it('should emit applySelection when the button is clicked', () => {
    vi.spyOn(component.applySelection, 'emit');
    fixture.nativeElement.querySelector('.apply-button').click();
    expect(component.applySelection.emit).toHaveBeenCalled();
  });

  it('should emit selectionChanged with the selected value', () => {
    vi.spyOn(component.selectionChanged, 'emit');
    component.selectValue('12');
    expect(component.selectionChanged.emit).toHaveBeenCalledWith('12');
  });

  it('should highlight the button when active in list mode', () => {
    component.isActive = true;
    fixture.detectChanges();
    const button: HTMLElement = fixture.nativeElement.querySelector('.apply-button');
    expect(button.style.backgroundColor).toBe('lightgrey');
  });

  it('should open the color input instead of the select in color mode', () => {
    component.inputType = 'color';
    fixture.detectChanges();
    const colorInputSpy = vi.spyOn(component.colorInput.nativeElement, 'click');
    const event = new MouseEvent('click');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    component.onClickSelect(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(colorInputSpy).toHaveBeenCalled();
  });

  /* The colour input used to start on black whatever was selected, because nothing handed it the
     selection (#1532). */
  it('should open the color input on the selected colour', () => {
    component.inputType = 'color';
    component.selectedValue = 'lightgrey';
    fixture.detectChanges();

    expect(component.colorInput.nativeElement.value).toBe('#d3d3d3');
  });

  it('should not intercept the select click in list mode', () => {
    const colorInputSpy = vi.spyOn(component.colorInput.nativeElement, 'click');
    component.onClickSelect(new MouseEvent('click'));
    expect(colorInputSpy).not.toHaveBeenCalled();
  });
});
