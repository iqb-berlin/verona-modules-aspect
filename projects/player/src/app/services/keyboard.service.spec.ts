import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/text-input-group-elements/text-field/text-field.component';
import {
  TextFieldSimpleComponent
} from 'common/components/text-input-group-elements/text-field-simple/text-field-simple.component';
import { TextAreaComponent } from 'common/components/text-input-group-elements/text-area/text-area.component';
import {
  SpellCorrectComponent
} from 'common/components/text-input-group-elements/spell-correct/spell-correct.component';

import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-input-group-elements/text-field-simple';
import { TextAreaElement } from 'common/models/elements/text-input-group-elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/text-input-group-elements/spell-correct';
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

  /* The two properties this service reads, on a real element model, and both differ from what the
     element brings by itself -- the preset defaults to none, the keyboard switch to true. Everything
     else comes from the element: the JSON fixtures this replaced carried sixty keys of the 1.3.0
     shape, of which exactly these mattered (#1171). */
  const withInputAssistance = <T>(element: T): T => Object.assign(element as object, {
    inputAssistancePreset: 'french',
    addInputAssistanceToKeyboard: false
  }) as T;

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
    textFieldComponent.elementModel = withInputAssistance(new TextFieldElement({ id: 'text-field_1' }));

    textFieldSimpleComponentFixture = TestBed.createComponent(TextFieldSimpleComponent);
    textFieldSimpleComponent = textFieldSimpleComponentFixture.componentInstance;
    textFieldSimpleComponent.elementModel =
      withInputAssistance(new TextFieldSimpleElement({ id: 'text-field-simple_1' }));

    textAreaComponentFixture = TestBed.createComponent(TextAreaComponent);
    textAreaComponent = textAreaComponentFixture.componentInstance;
    textAreaComponent.elementModel = withInputAssistance(new TextAreaElement({ id: 'text-area_1' }));

    spellCorrectComponentFixture = TestBed.createComponent(SpellCorrectComponent);
    spellCorrectComponent = spellCorrectComponentFixture.componentInstance;
    spellCorrectComponent.elementModel = withInputAssistance(new SpellCorrectElement({ id: 'spell-correct_1' }));

    textFieldComponentFixture.detectChanges();
    textFieldSimpleComponentFixture.detectChanges();
    textAreaComponentFixture.detectChanges();
    spellCorrectComponentFixture.detectChanges();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // textField

  it('should toggle keyboard to open', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', async () => {
    service.isOpen = true;
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textFieldComponent, true);
    expect(service.isOpen).toBe(false);
  });

  it('should not toggle keyboard to open', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent, false);
    expect(service.isOpen).toBe(false);
  });

  it('addInputAssistanceToKeyboard should be set to "false"', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent, true);
    expect(service.addInputAssistanceToKeyboard).toBe(false);
  });

  // textFieldSimple

  it('should toggle keyboard to open', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', async () => {
    service.isOpen = true;
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textFieldSimpleComponent, true);
    expect(service.isOpen).toBe(false);
  });

  it('should not toggle keyboard to open', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent, false);
    expect(service.isOpen).toBe(false);
  });

  it('addInputAssistanceToKeyboard should be set to "false"', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent, true);
    expect(service.addInputAssistanceToKeyboard).toBe(false);
  });

  // textArea

  it('should toggle keyboard to open', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', async () => {
    service.isOpen = true;
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textAreaComponent, true);
    expect(service.isOpen).toBe(false);
  });

  it('should not toggle keyboard to open', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent, false);
    expect(service.isOpen).toBe(false);
  });

  it('addInputAssistanceToKeyboard should be set to "false"', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent, true);
    expect(service.addInputAssistanceToKeyboard).toBe(false);
  });

  it('should toggle keyboard to open', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent, true);
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keyboard to close', async () => {
    service.isOpen = true;
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, spellCorrectComponent, true);
    expect(service.isOpen).toBe(false);
  });

  it('should not toggle keyboard to open', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent, false);
    expect(service.isOpen).toBe(false);
  });

  it('addInputAssistanceToKeyboard should be set to "false"', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent, true);
    expect(service.addInputAssistanceToKeyboard).toBe(false);
  });
});
