import { Directive } from '@angular/core';
import { Subject } from 'rxjs';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VopNavigationDeniedNotification } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { DeviceService } from 'player/src/app/services/device.service';
import {
  ElementModelElementCodeMappingService
} from 'player/src/app/services/element-model-element-code-mapping.service';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ValidationService } from 'player/src/app/services/validation.service';
import { TextInputGroupDirective } from './text-input-group.directive';

/* The directive is abstract, so it is tested through a minimal concrete subclass. */
@Directive()
class TestTextInputGroupDirective extends TextInputGroupDirective {
  constructor(public unitStateService: UnitStateService,
              public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
              public veronaSubscriptionService: VeronaSubscriptionService,
              public validationService: ValidationService,
              public deviceService: DeviceService,
              public keypadService: KeypadService,
              public keyboardService: KeyboardService,
              public mathKeyboardService: MathKeyboardService) {
    super();
  }
}

describe('TextInputGroupDirective', () => {
  let directive: TestTextInputGroupDirective;
  let deviceService: DeviceService;
  let keyboardService: SpyObj<KeyboardService>;
  let inputElement: HTMLInputElement;

  const createTextField = (maxLength: number, isLimitedToMaxLength: boolean): TextFieldElement => {
    const element = new TextFieldElement({ type: 'text-field', id: 'text-field_1' });
    element.maxLength = maxLength;
    element.isLimitedToMaxLength = isLimitedToMaxLength;
    return element;
  };

  const paste = (text: string, elementModel: TextFieldElement): ClipboardEvent => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', text);
    const event = new ClipboardEvent('paste', { clipboardData, cancelable: true });
    inputElement.addEventListener('paste', pasteEvent => directive.onPaste(pasteEvent, elementModel));
    inputElement.dispatchEvent(event);
    return event;
  };

  const keyDown = (key: string, elementModel: TextFieldElement): KeyboardEvent => {
    const keyboardEvent = new KeyboardEvent('keydown', { key, cancelable: true });
    directive.checkInputLimitation({ keyboardEvent, inputElement }, elementModel);
    return keyboardEvent;
  };

  beforeEach(() => {
    deviceService = { hasHardwareKeyboard: false } as DeviceService;
    keyboardService = createSpyObj<KeyboardService>(['close']);
    inputElement = document.createElement('input');
    document.body.appendChild(inputElement);

    directive = new TestTextInputGroupDirective(
      createSpyObj<UnitStateService>(['getElementCodeById', 'changeElementCodeValue']),
      createSpyObj<ElementModelElementCodeMappingService>(['mapToElementModelValue']),
      {
        vopNavigationDeniedNotification: new Subject<VopNavigationDeniedNotification>().asObservable()
      } as VeronaSubscriptionService,
      createSpyObj<ValidationService>(['registerFormControl']),
      deviceService,
      createSpyObj<KeypadService>(['toggleAsync', 'close']),
      keyboardService,
      createSpyObj<MathKeyboardService>(['toggle', 'close'])
    );
  });

  afterEach(() => {
    inputElement.remove();
    directive.ngOnDestroy();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should allow a paste that fits into the maximum length', () => {
    inputElement.value = 'ab';

    expect(paste('cde', createTextField(5, true)).defaultPrevented).toBe(false);
  });

  it('should block a paste that exceeds the maximum length', () => {
    inputElement.value = 'ab';

    expect(paste('cdef', createTextField(5, true)).defaultPrevented).toBe(true);
  });

  it('should count the replaced selection when pasting', () => {
    inputElement.value = 'abcd';
    inputElement.setSelectionRange(0, 3);

    expect(paste('xyz', createTextField(5, true)).defaultPrevented).toBe(false);
  });

  it('should allow any paste for elements without length limitation', () => {
    inputElement.value = 'ab';

    expect(paste('cdefghijkl', createTextField(5, false)).defaultPrevented).toBe(false);
  });

  it('should block an empty paste for limited elements', () => {
    expect(paste('', createTextField(5, true)).defaultPrevented).toBe(true);
  });

  it('should block a keystroke that exceeds the maximum length', () => {
    inputElement.value = 'abcde';

    expect(keyDown('f', createTextField(5, true)).defaultPrevented).toBe(true);
  });

  it('should allow a keystroke that fits into the maximum length', () => {
    inputElement.value = 'abcd';

    expect(keyDown('e', createTextField(5, true)).defaultPrevented).toBe(false);
  });

  it('should always allow navigation and deletion keys', () => {
    inputElement.value = 'abcde';
    const elementModel = createTextField(5, true);

    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].forEach(key => {
      expect(keyDown(key, elementModel).defaultPrevented).toBe(false);
    });
  });

  it('should allow any keystroke for elements without length limitation', () => {
    inputElement.value = 'abcde';

    expect(keyDown('f', createTextField(5, false)).defaultPrevented).toBe(false);
  });

  it('should close the software keyboard when a hardware keyboard is detected', () => {
    const elementModel = createTextField(5, true);
    elementModel.showSoftwareKeyboard = true;

    directive.detectHardwareKeyboard(elementModel);

    expect(deviceService.hasHardwareKeyboard).toBe(true);
    expect(keyboardService.close).toHaveBeenCalled();
  });

  it('should ignore a hardware keyboard for elements without software keyboard', () => {
    const elementModel = createTextField(5, true);
    elementModel.showSoftwareKeyboard = false;

    directive.detectHardwareKeyboard(elementModel);

    expect(deviceService.hasHardwareKeyboard).toBe(false);
    expect(keyboardService.close).not.toHaveBeenCalled();
  });
});
