import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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
      declarations: [ComboButtonComponent, MockMatTooltipDirective],
      imports: [MatButtonModule, MatIconModule, MatSelectModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ComboButtonComponent);
    component = fixture.componentInstance;
    component.inputType = 'list';
    component.icon = 'format_size';
    component.tooltip = 'Schriftgröße';
    component.availableValues = ['10', '12'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the icon', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').textContent).toContain('format_size');
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

  it('should not intercept the select click in list mode', () => {
    const colorInputSpy = vi.spyOn(component.colorInput.nativeElement, 'click');
    component.onClickSelect(new MouseEvent('click'));
    expect(colorInputSpy).not.toHaveBeenCalled();
  });
});
