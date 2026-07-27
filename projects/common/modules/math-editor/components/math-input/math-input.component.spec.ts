import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MathInputComponent } from './math-input.component';

describe('MathInputComponent', () => {
  let component: MathInputComponent;
  let fixture: ComponentFixture<MathInputComponent>;

  const createParseModeChange = (value: string): MatButtonToggleChange => new MatButtonToggleChange(
    null as unknown as MatButtonToggle, value
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MathInputComponent],
      imports: [MatButtonToggleModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MathInputComponent);
    component = fixture.componentInstance;
    component.value = '1+2';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should append the math field element to the input container', () => {
    expect(fixture.nativeElement.querySelector('math-field')).toBeTruthy();
  });

  it('should apply the initial value to the math field', () => {
    expect(component.mathFieldElement.getValue()).toBe('1+2');
  });

  it('should update the math field value on input changes', () => {
    component.ngOnChanges({
      value: new SimpleChange('1+2', 'x^2', false)
    });
    expect(component.mathFieldElement.getValue()).toBe('x^2');
  });

  it('should update the readonly state of the math field on input changes', () => {
    expect(component.mathFieldElement.readOnly).toBe(false);
    component.ngOnChanges({
      readonly: new SimpleChange(false, true, false)
    });
    expect(component.mathFieldElement.readOnly).toBe(true);
  });

  it('should emit the current math field value on input', () => {
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    component.mathFieldElement.setValue('a+b', { format: 'latex' });
    component.onInput();
    expect(emitSpy).toHaveBeenCalledWith('a+b');
  });

  it('should not show the mode switch by default', () => {
    expect(fixture.nativeElement.querySelector('mat-button-toggle-group')).toBeNull();
  });

  it('should show the mode switch when enabled', () => {
    component.enableModeSwitch = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-button-toggle-group')).toBeTruthy();
  });

  it('should leave the current group when switching to math mode', () => {
    const executeCommandSpy = vi.spyOn(component.mathFieldElement, 'executeCommand');
    component.setParseMode(createParseModeChange('math'));
    expect(executeCommandSpy).toHaveBeenCalledWith('moveAfterParent');
  });

  it('should not execute a command when switching to text mode', () => {
    const executeCommandSpy = vi.spyOn(component.mathFieldElement, 'executeCommand');
    component.setParseMode(createParseModeChange('text'));
    expect(executeCommandSpy).not.toHaveBeenCalled();
  });

  it('should emit focusIn and show the virtual keyboard on focus in', () => {
    const emitSpy = vi.spyOn(component.focusIn, 'emit');
    const showSpy = vi.spyOn(window.mathVirtualKeyboard, 'show');
    component.onFocusIn();
    expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
    expect(showSpy).toHaveBeenCalled();
  });

  it('should set a keyboard layout for every configured preset on focus in', () => {
    component.mathKeyboardPresets = ['math', 'greek'];
    component.onFocusIn();
    expect(window.mathVirtualKeyboard.layouts.length).toBe(2);
  });

  it('should emit focusOut and hide the virtual keyboard on focus out', () => {
    const emitSpy = vi.spyOn(component.focusOut, 'emit');
    const hideSpy = vi.spyOn(window.mathVirtualKeyboard, 'hide');
    component.onFocusOut();
    expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
    expect(hideSpy).toHaveBeenCalled();
  });
});
