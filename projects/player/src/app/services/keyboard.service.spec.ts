import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'key-input/key-input.module';
import { KeyboardService } from './keyboard.service';
import { TextFieldComponent } from 'common/components/ui-elements/text-field.component';
import { TextAreaComponent } from 'common/components/ui-elements/text-area.component';
import { SpellCorrectComponent } from 'common/components/ui-elements/spell-correct.component';

import * as textField_130 from 'test-data/element-models/text-field_130.json';
import * as textArea_130 from 'test-data/element-models/text-area_130.json';
import * as spellCorrect_130 from 'test-data/element-models/spell-correct_130.json';

describe('KeyboardService', () => {
  let service: KeyboardService;
  let textFieldComponentFixture: ComponentFixture<TextFieldComponent>;
  let textFieldComponent: TextFieldComponent;
  let textAreaComponentFixture: ComponentFixture<TextAreaComponent>;
  let textAreaComponent: TextAreaComponent;
  let spellCorrectComponentFixture: ComponentFixture<SpellCorrectComponent>;
  let spellCorrectComponent: SpellCorrectComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextFieldComponent, TextAreaComponent],
      imports: [
        BrowserAnimationsModule,
        KeyInputModule
      ]
    });
    service = TestBed.inject(KeyboardService);

    textFieldComponentFixture = TestBed.createComponent(TextFieldComponent);
    textFieldComponent = textFieldComponentFixture.componentInstance;
    textFieldComponent.elementModel = JSON.parse(JSON.stringify(textField_130));
    textFieldComponent.elementFormControl = new FormControl('');

    textAreaComponentFixture = TestBed.createComponent(TextAreaComponent);
    textAreaComponent = textAreaComponentFixture.componentInstance;
    textAreaComponent.elementModel = JSON.parse(JSON.stringify(textArea_130));
    textAreaComponent.elementFormControl = new FormControl('');

    spellCorrectComponentFixture = TestBed.createComponent(SpellCorrectComponent);
    spellCorrectComponent = spellCorrectComponentFixture.componentInstance;
    spellCorrectComponent.elementModel = JSON.parse(JSON.stringify(spellCorrect_130));
    spellCorrectComponent.elementFormControl = new FormControl('');

    textFieldComponentFixture.detectChanges();
    textAreaComponentFixture.detectChanges();
    spellCorrectComponentFixture.detectChanges();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // textField

  it('should toggle keypad to open', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to open', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    expect(service.toggle(input, textFieldComponent, true)).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    service.toggle(null, textFieldComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    expect(service.toggle(null, textFieldComponent, true)).toBeFalse();
  });

  it('should not toggle keypad to open', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keypad to open', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    expect(service.toggle(input, textFieldComponent, false)).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 1);
    service.toggle(input, textFieldComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent, true);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 0);
    service.toggle(input, textFieldComponent, true);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textFieldComponent, true);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textFieldComponent, true);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });

  // textArea

  it('should toggle keypad to open', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to open', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(service.toggle(input, textAreaComponent, true)).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    service.toggle(null, textAreaComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    expect( service.toggle(null, textAreaComponent, true)).toBeFalse();
  });

  it('should not toggle keypad to open', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keypad to open', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(service.toggle(input, textAreaComponent, false)).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textFieldComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(0, 1);
    service.toggle(input, textAreaComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent, true);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(0, 0);
    service.toggle(input, textAreaComponent, true);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textAreaComponent, true);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textAreaComponent, true);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });

  // spellCorrect

  it('should toggle keypad to open', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to open', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    expect( service.toggle(input, textFieldComponent, true)).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    service.toggle(null, spellCorrectComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    expect(service.toggle(null, spellCorrectComponent, true)).toBeFalse();
  });

  it('should not toggle keypad to open', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, spellCorrectComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keypad to open', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    expect( service.toggle(input, spellCorrectComponent, false)).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 1);
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent, true);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 0);
    service.toggle(input, spellCorrectComponent, true);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, spellCorrectComponent, true);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, spellCorrectComponent, true);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, spellCorrectComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });
});
