import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
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

  /** Toggles for the text field, lets the service's 100 ms pause pass and answers what it resolved with. */
  const toggle = (focused: boolean, isMobileWithoutHardwareKeyboard: boolean): boolean | undefined => {
    const inputElement = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    let result: boolean | undefined;
    service.toggleAsync({ inputElement, focused }, textFieldComponent, isMobileWithoutHardwareKeyboard)
      .then(value => { result = value; });
    tick(100);
    return result;
  };

  it('should toggle keyboard to open', fakeAsync(() => {
    expect(toggle(true, true)).toBe(true);
    expect(service.isOpen).toBe(true);
  }));

  /* Moving from one field to the next closes and reopens the keyboard at once; the pause is what keeps
     that from flickering, and it must not be shortened (63add4cd, #1143). */
  it('should wait 100 ms before it toggles', fakeAsync(() => {
    const inputElement = textFieldComponent.domElement.querySelector('input') as HTMLInputElement;
    service.toggleAsync({ inputElement, focused: true }, textFieldComponent, true);

    tick(99);
    expect(service.isOpen).toBe(false);
    tick(1);
    expect(service.isOpen).toBe(true);
  }));

  it('should toggle keyboard to close', fakeAsync(() => {
    service.isOpen = true;
    toggle(false, true);
    expect(service.isOpen).toBe(false);
  }));

  it('should close the keyboard for a focused field on a device with a hardware keyboard', fakeAsync(() => {
    service.isOpen = true;
    toggle(true, false);
    expect(service.isOpen).toBe(false);
  }));

  it('should take the key set and the height without the assistance row from the element', fakeAsync(() => {
    service.addInputAssistanceToKeyboard = true;
    toggle(true, true);
    expect(service.addInputAssistanceToKeyboard).toBe(false);
    expect(service.preset).toBe('french');
    expect(service.keyboardHeight).toBe(280);
  }));
});
