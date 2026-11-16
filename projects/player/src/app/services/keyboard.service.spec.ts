import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/elements/text-field/text-field.component';

import { TextFieldElement } from 'common/models/elements/text-field';
import { APIService } from 'common/shared.module';
import { KeyboardService } from './keyboard.service';

describe('KeyboardService', () => {
  let service: KeyboardService;
  let textFieldComponentFixture: ComponentFixture<TextFieldComponent>;
  let textFieldComponent: TextFieldComponent;

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

    textFieldComponentFixture.detectChanges();
  });

  // One element type is enough: the service reads the element model and does not tell the types apart.

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

  it('should take addInputAssistanceToKeyboard from the element', async () => {
    service.addInputAssistanceToKeyboard = true;
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent, true);
    expect(service.addInputAssistanceToKeyboard).toBe(false);
  });
});
