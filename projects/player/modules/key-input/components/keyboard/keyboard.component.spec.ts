// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardComponent } from 'player/modules/key-input/components/keyboard/keyboard.component';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { KeyLayout } from 'player/modules/key-input/configs/key-layout';
import { GetAlternativeKeyPipe } from 'player/modules/key-input/pipes/get-alternative-key.pipe';

describe('KeyboardComponent', () => {
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;
  let clickedKeys: string[];
  let backspaceCount: number;

  @Component({
    selector: 'aspect-keyboard-key', template: '',
    standalone: false
})
  class KeyboardKeyComponent {
    @Input() key!: string;
    @Input() alternativeKey!: string;
  }

  const additionalKeys = (): string[] => fixture.debugElement
    .queryAll(By.css('.additional-character'))
    .map(debugElement => (debugElement.componentInstance as KeyboardKeyComponent).key);

  beforeEach(async () => {
    clickedKeys = [];
    backspaceCount = 0;

    await TestBed.configureTestingModule({
      declarations: [
        KeyboardComponent,
        KeyboardKeyComponent,
        GetAlternativeKeyPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    component.keyClicked.subscribe(key => clickedKeys.push(key));
    component.backspaceClicked.subscribe(() => { backspaceCount += 1; });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the default keyboard layout', () => {
    expect(component.shift).toBe(false);
    expect(component.rows).toEqual(KeyLayout.get('keyboard').default);
    expect(component.additionalRow).toEqual([]);
  });

  it('should emit a clicked character', () => {
    component.evaluateClickedKeyValue('a');

    expect(clickedKeys).toEqual(['a']);
  });

  it('should emit a line break for the return key', () => {
    component.evaluateClickedKeyValue('Return');

    expect(clickedKeys).toEqual(['\n']);
  });

  it('should emit a blank for the space key', () => {
    component.evaluateClickedKeyValue('Space');

    expect(clickedKeys).toEqual([' ']);
  });

  it('should report the backspace key separately', () => {
    component.evaluateClickedKeyValue('Backspace');

    expect(backspaceCount).toBe(1);
    expect(clickedKeys).toEqual([]);
  });

  it('should switch to the shift layout', () => {
    component.evaluateClickedKeyValue('Shift');

    expect(component.shift).toBe(true);
    expect(component.rows).toEqual(KeyLayout.get('keyboard').shift);
  });

  it('should switch back from the shift layout', () => {
    component.evaluateClickedKeyValue('Shift');

    component.evaluateClickedKeyValue('ShiftUp');

    expect(component.shift).toBe(false);
    expect(component.rows).toEqual(KeyLayout.get('keyboard').default);
  });

  it('should leave the shift layout after a character was typed', () => {
    component.evaluateClickedKeyValue('Shift');

    component.evaluateClickedKeyValue('A');

    expect(clickedKeys).toEqual(['A']);
    expect(component.shift).toBe(false);
  });

  it('should blur the focused element for the close key', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    const blur = vi.spyOn(input, 'blur');

    component.evaluateClickedKeyValue('close');

    expect(blur).toHaveBeenCalled();
    input.remove();
  });

  it('should not show an additional row without input assistance', () => {
    component.preset = 'french';
    component.addInputAssistanceToKeyboard = false;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.additionalRow).toEqual([]);
    expect(additionalKeys()).toEqual([]);
  });

  it('should show the characters of the input assistance as additional row', () => {
    component.preset = 'french';
    component.addInputAssistanceToKeyboard = true;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.additionalRow).toEqual(KeyLayout.get('french').default.flat()
      .filter(key => key.length === 1));
    expect(additionalKeys()).toEqual(component.additionalRow);
  });

  it('should switch the additional row to the shift characters', () => {
    component.preset = 'french';
    component.addInputAssistanceToKeyboard = true;
    component.ngOnInit();

    component.evaluateClickedKeyValue('Shift');

    expect(component.additionalRow).toEqual(KeyLayout.get('french').shift.flat()
      .filter(key => key.length === 1));
  });

  it('should keep the default characters for presets without shift layout', () => {
    component.preset = 'numbers';
    component.addInputAssistanceToKeyboard = true;
    component.ngOnInit();
    const defaultRow = [...component.additionalRow];

    component.evaluateClickedKeyValue('Shift');

    expect(component.additionalRow).toEqual(defaultRow);
  });
});
