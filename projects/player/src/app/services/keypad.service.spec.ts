import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'key-input/key-input.module';
import { KeypadService } from './keypad.service';
import { TextFieldComponent } from 'common/components/ui-elements/text-field.component';
import { TextAreaComponent } from 'common/components/ui-elements/text-area.component';
import { SpellCorrectComponent } from 'common/components/ui-elements/spell-correct.component';

import * as textField_130 from 'test-data/element-models/text-field_130.json';
import * as textArea_130 from 'test-data/element-models/text-area_130.json';
import * as spellCorrect_130 from 'test-data/element-models/spell-correct_130.json';

describe('KeypadService', () => {
  let service: KeypadService;
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
    service = TestBed.inject(KeypadService);

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
    service.toggle(input, textFieldComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to open', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    expect(service.toggle(input, textFieldComponent)).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    service.toggle(null, textFieldComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    expect(service.toggle(null, textFieldComponent)).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 1);
    service.toggle(input, textFieldComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 0);
    service.toggle(input, textFieldComponent);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textFieldComponent);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textFieldComponent);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const input = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent);
    expect(service.position).toEqual('floating');
  });

  // textArea

  it('should toggle keypad to open', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to open', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(service.toggle(input, textAreaComponent)).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    service.toggle(null, textAreaComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    expect( service.toggle(null, textAreaComponent)).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(0, 1);
    service.toggle(input, textAreaComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'n';
    input.setSelectionRange(0, 0);
    service.toggle(input, textAreaComponent);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textAreaComponent);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, textAreaComponent);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const input = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    service.toggle(input, textAreaComponent);
    expect(service.position).toEqual('floating');
  });

  // spellCorrect

  it('should toggle keypad to open', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to open', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    expect( service.toggle(input, textFieldComponent)).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    service.toggle(null, spellCorrectComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    expect(service.toggle(null, spellCorrectComponent)).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, spellCorrectComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 1);
    service.toggle(input, spellCorrectComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'n';
    input.setSelectionRange(0, 0);
    service.toggle(input, spellCorrectComponent);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, spellCorrectComponent);
    service.deleterCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    input.value = 'all values';
    input.setSelectionRange(0, input.value.length);
    service.toggle(input, spellCorrectComponent);
    service.deleterCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, spellCorrectComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const input = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggle(input, spellCorrectComponent);
    expect(service.position).toEqual('floating');
  });
});
