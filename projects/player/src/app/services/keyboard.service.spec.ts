import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';

import * as textField_130 from 'test-data/element-models/text-field_130.json';
import * as textFieldSimple_131 from 'test-data/element-models/text-field-simple_131.json';
import * as textArea_130 from 'test-data/element-models/text-area_130.json';
import * as spellCorrect_130 from 'test-data/element-models/spell-correct_130.json';
import { APIService } from 'common/shared.module';
import { KeyboardService } from './keyboard.service';

describe('KeyboardService', () => {
  let service: KeyboardService;
  let textFieldComponentFixture: ComponentFixture<TextFieldComponent>;
  let textFieldComponent: TextFieldComponent;
  let textFieldSimpleComponentFixture: ComponentFixture<TextFieldSimpleComponent>;
  let textFieldSimpleComponent: TextFieldSimpleComponent;
  let textAreaComponentFixture: ComponentFixture<TextAreaComponent>;
  let textAreaComponent: TextAreaComponent;
  let spellCorrectComponentFixture: ComponentFixture<SpellCorrectComponent>;
  let spellCorrectComponent: SpellCorrectComponent;

  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        KeyInputModule
      ],
      providers: [{ provide: APIService, useClass: ApiStubService }]
    });
    service = TestBed.inject(KeyboardService);

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

  it('should toggle keyboard to open', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', () => {
    service.isOpen = true;
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, textFieldComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keyboard to open', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, textFieldComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, textFieldComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });

  // textFieldSimple

  it('should toggle keyboard to open', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', () => {
    service.isOpen = true;
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, textFieldSimpleComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keyboard to open', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldSimpleComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, textFieldSimpleComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textFieldSimpleComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, textFieldSimpleComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldSimpleComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textFieldSimpleComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textFieldSimpleComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });

  // textArea

  it('should toggle keyboard to open', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', () => {
    service.isOpen = true;
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, textAreaComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keyboard to open', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, textAreaComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, textAreaComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, textAreaComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textAreaComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, textAreaComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, textAreaComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });

  // spellCorrect

  it('should toggle keyboard to open', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', () => {
    service.isOpen = true;
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    service.toggle(input, spellCorrectComponent, true);
    expect(service.isOpen).toBeFalse();
  });

  it('should not toggle keyboard to open', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent, false);
    expect(service.isOpen).toBeFalse();
  });

  it('should set the inputElement of the service', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('n');
    expect(service.inputElement).toEqual(input.inputElement);
  });

  it('enter "n" should set the inputElement.value of the service value to "n"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('n');
    expect(service.inputElement.value).toEqual('n');
  });

  it('enter "!" should set the inputElement.value of the service value to "n!"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('n!');
  });

  it('enter "!" should replace the inputElement.value of the service with to "!"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 1);
    service.toggle(input, spellCorrectComponent, true);
    service.enterKey('!');
    expect(service.inputElement.value).toEqual('!');
  });

  it('deleterCharacters with parameter true should deleterCharacters backwards', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(1, 1);
    service.toggle(input, spellCorrectComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should deleterCharacters forwards', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'n';
    element.setSelectionRange(0, 0);
    service.toggle(input, spellCorrectComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter true should delete all characters', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, spellCorrectComponent, true);
    service.deleteCharacters(true);
    expect(service.inputElement.value).toEqual('');
  });

  it('deleterCharacters with parameter false should delete all characters', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    element.value = 'all values';
    element.setSelectionRange(0, element.value.length);
    service.toggle(input, spellCorrectComponent, true);
    service.deleteCharacters(false);
    expect(service.inputElement.value).toEqual('');
  });

  it('alternativeKeyboardShowFrench should be set to "false"', () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    service.toggle(input, spellCorrectComponent, true);
    expect(service.alternativeKeyboardShowFrench).toBeFalse();
  });
});
