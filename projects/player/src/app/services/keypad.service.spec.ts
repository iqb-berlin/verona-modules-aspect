import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';

import * as textField_130 from 'test-data/element-models/text-field_130.json';
import * as textFieldSimple_131 from 'test-data/element-models/text-field-simple_131.json';
import * as textArea_130 from 'test-data/element-models/text-area_130.json';
import * as spellCorrect_130 from 'test-data/element-models/spell-correct_130.json';
import { KeypadService } from './keypad.service';

describe('KeypadService', () => {
  let service: KeypadService;
  let textFieldComponentFixture: ComponentFixture<TextFieldComponent>;
  let textFieldComponent: TextFieldComponent;
  let textFieldSimpleComponentFixture: ComponentFixture<TextFieldSimpleComponent>;
  let textFieldSimpleComponent: TextFieldSimpleComponent;
  let textAreaComponentFixture: ComponentFixture<TextAreaComponent>;
  let textAreaComponent: TextAreaComponent;
  let spellCorrectComponentFixture: ComponentFixture<SpellCorrectComponent>;
  let spellCorrectComponent: SpellCorrectComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        KeyInputModule
      ]
    });
    service = TestBed.inject(KeypadService);

    textFieldComponentFixture = TestBed.createComponent(TextFieldComponent);
    textFieldComponent = textFieldComponentFixture.componentInstance;
    textFieldComponent.elementModel = JSON.parse(JSON.stringify(textField_130));

    textFieldSimpleComponentFixture = TestBed.createComponent(TextFieldSimpleComponent);
    textFieldSimpleComponent = textFieldSimpleComponentFixture.componentInstance;
    textFieldSimpleComponent.elementModel = JSON.parse(JSON.stringify(textFieldSimple_131));

    textAreaComponentFixture = TestBed.createComponent(TextAreaComponent);
    textAreaComponent = textAreaComponentFixture.componentInstance;
    textAreaComponent.elementModel = JSON.parse(JSON.stringify(textArea_130));

    spellCorrectComponentFixture = TestBed.createComponent(SpellCorrectComponent);
    spellCorrectComponent = spellCorrectComponentFixture.componentInstance;
    spellCorrectComponent.elementModel = JSON.parse(JSON.stringify(spellCorrect_130));

    textFieldComponentFixture.detectChanges();
    textFieldSimpleComponentFixture.detectChanges();
    textAreaComponentFixture.detectChanges();
    spellCorrectComponentFixture.detectChanges();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // textField

  it('should toggle keypad to open', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, textFieldComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, textFieldComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, textFieldComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent);
    expect(service.position).toEqual('floating');
  });

  // textFieldSimple

  it('should toggle keypad to open', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, textFieldSimpleComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldSimpleComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, textFieldSimpleComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldSimpleComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, textFieldSimpleComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldSimpleComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldSimpleComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent);
    expect(service.position).toEqual('floating');
  });

  // textArea

  it('should toggle keypad to open', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, textAreaComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, textAreaComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, textAreaComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textAreaComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textAreaComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent);
    expect(service.position).toEqual('floating');
  });

  // spellCorrect

  it('should toggle keypad to open', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', () => {
    service.isOpen = true;
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, spellCorrectComponent);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, spellCorrectComponent);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, spellCorrectComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, spellCorrectComponent);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, spellCorrectComponent);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('preset should be set to "french"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent);
    expect(service.position).toEqual('floating');
  });
});
