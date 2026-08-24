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

  /* window.mathVirtualKeyboard is a page-wide singleton, so a spy left on it outlives the test and
     hands its recorded calls to the next spy on the same method. */
  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should keep resetting the shift for the math inputs that are still alive', () => {
    const secondInput = TestBed.createComponent(MathInputComponent);
    secondInput.detectChanges();

    secondInput.destroy();
    window.mathVirtualKeyboard.shiftPressCount = 2;
    window.mathVirtualKeyboard.dispatchEvent(new Event('virtual-keyboard-layer-change'));

    /* The listener belongs to the keyboard singleton, not to a component: the fixture from
       beforeEach is still on the page, so the one destroyed above must not have taken it along.
       This is what guards the deliberate absence of an ngOnDestroy here (#1123). */
    expect(window.mathVirtualKeyboard.shiftPressCount).toBe(0);
  });

  it('should register one and the same layer-change listener for every math input', () => {
    const addEventListener = vi.spyOn(window.mathVirtualKeyboard, 'addEventListener');

    TestBed.createComponent(MathInputComponent).detectChanges();
    TestBed.createComponent(MathInputComponent).detectChanges();

    /* mathlive holds its listeners in a Set, so one shared reference means one registration --
       a fresh arrow per component would have grown that Set without bound (#1123). */
    const listeners = addEventListener.mock.calls
      .filter(call => call[0] === 'virtual-keyboard-layer-change')
      .map(call => call[1]);
    expect(listeners.length).toBe(2);
    expect(new Set(listeners).size).toBe(1);
  });

  it('should emit focusOut and hide the virtual keyboard on focus out', () => {
    const emitSpy = vi.spyOn(component.focusOut, 'emit');
    const hideSpy = vi.spyOn(window.mathVirtualKeyboard, 'hide');
    component.onFocusOut();
    expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
    expect(hideSpy).toHaveBeenCalled();
  });
});
