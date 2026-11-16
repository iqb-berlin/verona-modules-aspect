import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeyInputModule } from 'player/modules/key-input/key-input.module';
import { TextFieldComponent } from 'common/components/elements/text-field/text-field.component';

import { TextFieldElement } from 'common/models/elements/text-field';
import { APIService } from 'common/shared.module';
import { KeypadService } from './keypad.service';

describe('KeypadService', () => {
  let service: KeypadService;
  let textFieldComponentFixture: ComponentFixture<TextFieldComponent>;
  let textFieldComponent: TextFieldComponent;

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

    textFieldComponentFixture.detectChanges();
  });

  // One element type is enough: the service reads the element model and does not tell the types apart.

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

  it('position should be set to "right"', async () => {
    const element = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    const input = { inputElement: element, focused: true };
    await service.toggleAsync(input, textFieldComponent);
    expect(service.position).toEqual('right');
  });
});
