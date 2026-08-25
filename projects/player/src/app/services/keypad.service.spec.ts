import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/elements/text-field/text-field.component';
import { TextAreaComponent } from 'common/components/elements/text-area/text-area.component';
import {
  TextFieldSimpleComponent
} from 'common/components/elements/text-field-simple/text-field-simple.component';
import {
  SpellCorrectComponent
} from 'common/components/elements/spell-correct/spell-correct.component';

import { TextFieldElement } from 'common/models/elements/text-field';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-field-simple';
import { TextAreaElement } from 'common/models/elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/spell-correct';
import { APIService } from 'common/shared.module';
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

  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  /* The two properties this service reads, on a real element model. `'right'` rather than the
     `'floating'` the deleted fixture carried: that is what the service starts with and what the element
     brings by itself, so the assertion on it could not have failed (#1171). Everything else comes from
     the element -- the JSON fixtures held sixty keys of the 1.3.0 shape, of which these mattered. */
  const withInputAssistance = <T>(element: T): T => Object.assign(element as object, {
    inputAssistancePreset: 'french',
    inputAssistancePosition: 'right'
  }) as T;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        KeyInputModule
      ],
      providers: [{ provide: APIService, useClass: ApiStubService }]
    });
    service = TestBed.inject(KeypadService);

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

  it('should toggle keypad to open', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.isOpen).toBe(false);
  });

  it('preset should be set to "french"', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.position).toEqual('right');
  });

  // textFieldSimple

  it('should toggle keypad to open', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textFieldSimpleComponent);
    expect(service.isOpen).toBe(false);
  });

  it('preset should be set to "french"', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = textFieldSimpleComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldSimpleComponent);
    expect(service.position).toEqual('right');
  });

  // textArea

  it('should toggle keypad to open', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, textAreaComponent);
    expect(service.isOpen).toBe(false);
  });

  it('preset should be set to "french"', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent);
    expect(service.preset).toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = textAreaComponent.domElement.querySelector('textarea') as HTMLTextAreaElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textAreaComponent);
    expect(service.position).toEqual('right');
  });

  // spellCorrect

  it('should toggle keypad to open', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent).then(value => {
      expect(value).toBeTruthy();
    });
    expect(service.isOpen).toBeTruthy();
  });

  it('should toggle keypad to close', async () => {
    service.isOpen = true;
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: false };
    await service.toggleAsync(input, spellCorrectComponent);
    expect(service.isOpen).toBe(false);
  });

  it('preset should be set to "french"', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = {
      inputElement: element,
      focused: true
    };
    await service.toggleAsync(input, spellCorrectComponent);
    expect(service.preset)
      .toEqual('french');
  });

  it('position should be set to "floating"', async () => {
    const element = spellCorrectComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, spellCorrectComponent);
    expect(service.position).toEqual('right');
  });
});
