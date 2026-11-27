import { Directive, EventEmitter, signal } from '@angular/core';
import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { TextFieldElement } from 'common/models/elements/text-field';
import { TextAreaElement } from 'common/models/elements/text-area';
import { TextAreaMathElement } from 'common/models/elements/text-area-math';
import { TextAreaComponent } from 'common/components/elements/text-area/text-area.component';
import { WordCounter } from 'player/src/app/classes/word-counter';
import { CaretScroller } from 'player/src/app/classes/caret-scroller';
import { RangeSelectionService } from 'common/services/range-selection.service';
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
import {
  KeyInputRestrictionService
} from 'player/modules/key-input/services/key-input-restriction.service';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
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
              public mathKeyboardService: MathKeyboardService,
              public keyInputRestrictionService: KeyInputRestrictionService) {
    super();
  }
}

describe('TextInputGroupDirective', () => {
  let directive: TestTextInputGroupDirective;
  let deviceService: DeviceService;
  let keyboardService: SpyObj<KeyboardService>;
  let keyInputRestrictionService: SpyObj<KeyInputRestrictionService>;
  let inputElement: HTMLInputElement;

  const createTextField = (maxLength: number, isLimitedToMaxLength: boolean): TextFieldElement => {
    const element = new TextFieldElement({ type: 'text-field', id: 'text-field_1' });
    element.maxLength = maxLength;
    element.isLimitedToMaxLength = isLimitedToMaxLength;
    return element;
  };

  const createRestrictedTextField = (): TextFieldElement => {
    const element = new TextFieldElement({ type: 'text-field', id: 'text-field_2' });
    element.inputAssistancePreset = 'comma';
    element.restrictedToInputAssistanceChars = true;
    element.showSoftwareKeyboard = false;
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

  const createDirective = (): TestTextInputGroupDirective => new TestTextInputGroupDirective(
    createSpyObj<UnitStateService>(['getElementCodeById', 'changeElementCodeValue']),
    createSpyObj<ElementModelElementCodeMappingService>(['mapToElementModelValue']),
    {
      vopNavigationDeniedNotification: new Subject<VopNavigationDeniedNotification>().asObservable()
    } as VeronaSubscriptionService,
    createSpyObj<ValidationService>(['registerFormControl']),
    deviceService,
    createSpyObj<KeypadService>(['toggleAsync', 'close']),
    keyboardService,
    createSpyObj<MathKeyboardService>(['toggle', 'close']),
    keyInputRestrictionService
  );

  beforeEach(() => {
    deviceService = { hasHardwareKeyboard: false } as DeviceService;
    keyboardService = createSpyObj<KeyboardService>(['close']);
    keyInputRestrictionService = createSpyObj<KeyInputRestrictionService>(['attach', 'detach', 'detachFrom']);
    inputElement = document.createElement('input');
    document.body.appendChild(inputElement);

    directive = createDirective();
  });

  afterEach(() => {
    inputElement.remove();
    directive.ngOnDestroy();
  });

  /** A formula area as the template renders it: the text part, a formula, and an empty last text part. */
  const createFormulaArea = (text: string): { container: HTMLElement; firstPart: HTMLElement } => {
    const container = document.createElement('div');
    const parts = ['text', 'math', 'text'].map(() => document.createElement('aspect-text-area-math-segment'));
    const firstPart = document.createElement('span');
    firstPart.contentEditable = 'true';
    firstPart.style.whiteSpace = 'pre-wrap';
    firstPart.textContent = text;
    parts[0].appendChild(firstPart);
    container.append(...parts);
    document.body.appendChild(container);
    return { container, firstPart };
  };

  /* The keypad opens 100 ms after the focus, so a restriction that waited for its view left the
     field unchecked long enough to type into it (#1143). Asserted without awaiting on purpose:
     the call has to have happened by the time toggleKeyInput yields. */
  it('should restrict the keys as soon as the field is focused', () => {
    const elementModel = createRestrictedTextField();

    directive.toggleKeyInput({ inputElement, focused: true },
                             { elementModel } as unknown as TextInputComponentType);

    expect(keyInputRestrictionService.attach).toHaveBeenCalledWith(inputElement, {
      allowedKeys: [','],
      hasArrowKeys: false,
      hasReturnKey: false
    });
  });

  /* A page navigation or a new unit destroys the component without a blur, so nothing else would
     release the field and the singleton would keep a detached input alive (#1143). */
  it('should release the restricted field when destroyed', () => {
    const elementModel = createRestrictedTextField();
    directive.toggleKeyInput({ inputElement, focused: true },
                             { elementModel } as unknown as TextInputComponentType);

    directive.ngOnDestroy();

    expect(keyInputRestrictionService.detachFrom).toHaveBeenCalledWith(inputElement);
  });

  it('should stop restricting the keys when the field loses the focus', () => {
    const elementModel = createRestrictedTextField();

    directive.toggleKeyInput({ inputElement, focused: false },
                             { elementModel } as unknown as TextInputComponentType);

    expect(keyInputRestrictionService.detachFrom).toHaveBeenCalled();
  });

  it('should not restrict the keys of a field without the restriction', () => {
    const elementModel = createRestrictedTextField();
    elementModel.restrictedToInputAssistanceChars = false;

    directive.toggleKeyInput({ inputElement, focused: true },
                             { elementModel } as unknown as TextInputComponentType);

    expect(keyInputRestrictionService.attach).not.toHaveBeenCalled();
    expect(keyInputRestrictionService.detachFrom).toHaveBeenCalled();
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

  /* Only the formula area's text is typed into through a selection range; text fields and text areas set
     their caret with setSelectionRange. The scrolling for #1661 must reach the first and none of the others. */
  describe('caret after a key of the on-screen keyboard', () => {
    let keyboardEvents: { enterKey: EventEmitter<string>; deleteCharacters: EventEmitter<boolean> };
    let scrollCaretIntoView: ReturnType<typeof vi.spyOn>;
    const fields: HTMLElement[] = [];

    /** Types the key on the keyboard into the field, with the caret at the given offset. */
    const typeOnKeyboard = (elementModel: UIElement, field: HTMLElement, key = 'x', caret = 0): void => {
      fields.push(field);
      if (!field.isConnected) document.body.appendChild(field);
      directive.elementModel = elementModel;
      directive.toggleKeyInput({ inputElement: field, focused: true }, {
        elementModel,
        setElementValue: (value: string) => {
          if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = value;
          else field.textContent = value;
        }
      } as unknown as TextInputComponentType);
      flushMicrotasks();
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.setSelectionRange(caret, caret);
      } else {
        RangeSelectionService.setSelectionRange(field, caret, caret);
      }
      keyboardEvents.enterKey.emit(key);
      // The caret of an editable text is set in the next frame
      tick(16);
    };

    beforeEach(() => {
      keyboardEvents = { enterKey: new EventEmitter<string>(), deleteCharacters: new EventEmitter<boolean>() };
      directive.keyboardService = {
        ...keyboardEvents,
        isOpen: true,
        toggleAsync: vi.fn().mockResolvedValue(true),
        close: vi.fn()
      } as unknown as KeyboardService;
      scrollCaretIntoView = vi.spyOn(CaretScroller, 'scrollIntoView').mockImplementation(() => {});
    });

    afterEach(() => {
      fields.splice(0).forEach(field => field.remove());
    });

    it('should keep the caret of a formula area in sight through the CaretScroller', fakeAsync(() => {
      const segment = document.createElement('span');
      segment.contentEditable = 'true';
      segment.textContent = 'abc';

      typeOnKeyboard(new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' }), segment);

      expect(segment.textContent).toBe('xabc');
      expect(scrollCaretIntoView).toHaveBeenCalledTimes(1);
    }));

    it('should leave the caret of a text field to the field', fakeAsync(() => {
      const textField = document.createElement('input');

      typeOnKeyboard(createTextField(5, false), textField);

      expect(textField.value).toBe('x');
      expect(scrollCaretIntoView).not.toHaveBeenCalled();
    }));

    it('should leave the caret of a text area to the area', fakeAsync(() => {
      const textArea = document.createElement('textarea');

      typeOnKeyboard(new TextAreaElement({ type: 'text-area', id: 'text-area_1' }), textArea);

      expect(textArea.value).toBe('x');
      expect(scrollCaretIntoView).not.toHaveBeenCalled();
    }));

    /* A line break at the end of an editable text gets no line of its own until something follows it, so
       the new line appeared only with the next key (#1011). */
    it('should open the new line at once when Return ends the text of a formula area (#1011)', fakeAsync(() => {
      const segment = document.createElement('span');
      segment.contentEditable = 'true';
      segment.style.whiteSpace = 'pre-wrap';
      segment.textContent = 'abc';

      typeOnKeyboard(new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' }), segment, '\n', 3);

      expect(segment.textContent).toBe('abc\n\n');
      const caret = RangeSelectionService.getRange() as Range;
      expect(caret.startContainer.textContent).toBe('\n');
      expect(caret.startOffset).toBe(0);
    }));

    /* Backspace took back only the first of the two line breaks, and the answer kept the other one, which
       nobody could see or delete (#1011). */
    it('should keep no line break when Backspace takes back Return at the end of a formula area', fakeAsync(() => {
      const segment = document.createElement('span');
      segment.contentEditable = 'true';
      segment.style.whiteSpace = 'pre-wrap';
      segment.textContent = 'abc';
      typeOnKeyboard(new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' }), segment, '\n', 3);

      keyboardEvents.deleteCharacters.emit(true);
      tick(16);

      expect(segment.textContent).toBe('abc');
    }));

    /* Removing a formula focuses the merged text at its end, behind the line break that keeps the last line
       open. Return there counted as one at the very end and added two line breaks more (#1011). */
    it('should take a caret behind the line that is kept open for one in front of it', fakeAsync(() => {
      const segment = document.createElement('span');
      segment.contentEditable = 'true';
      segment.style.whiteSpace = 'pre-wrap';
      segment.textContent = 'abc\n\n';

      typeOnKeyboard(new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' }), segment, '\n', 5);

      expect(segment.textContent).toBe('abc\n\n\n');
    }));

    it('should leave a line break at the end of a text area to the area', fakeAsync(() => {
      const textArea = document.createElement('textarea');
      textArea.value = 'abc';

      typeOnKeyboard(new TextAreaElement({ type: 'text-area', id: 'text-area_1' }), textArea, '\n', 3);

      expect(textArea.value).toBe('abc\n');
    }));

    /* Before a formula the formula itself opens the new line; a second line break would add an empty one. */
    it('should insert a single line break at the end of a text part that a formula follows', fakeAsync(() => {
      const area = createFormulaArea('abc');
      fields.push(area.container);

      typeOnKeyboard(
        new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' }), area.firstPart, '\n', 3
      );

      expect(area.firstPart.textContent).toBe('abc\n');
    }));
  });

  describe('caret after an arrow key of the keypad', () => {
    let keypadEvents: { select: EventEmitter<string> };
    const fields: HTMLElement[] = [];

    /** Opens the keypad for the text part, puts the caret at the offset and presses the arrow key. */
    const pressArrow = (field: HTMLElement, caret: number, key: string): void => {
      fields.push(field);
      if (!field.isConnected) document.body.appendChild(field);
      const elementModel = new TextAreaMathElement({ type: 'text-area-math', id: 'text-area-math_1' });
      elementModel.inputAssistancePreset = 'numbers';
      elementModel.hasArrowKeys = true;
      elementModel.showSoftwareKeyboard = false;
      directive.elementModel = elementModel;
      directive.toggleKeyInput({ inputElement: field, focused: true }, {
        elementModel,
        setElementValue: (value: string) => { field.textContent = value; }
      } as unknown as TextInputComponentType);
      flushMicrotasks();
      RangeSelectionService.setSelectionRange(field, caret, caret);
      keypadEvents.select.emit(key);
      // The caret of an editable text is set in the next frame
      tick(16);
    };

    const caretOffset = (field: HTMLElement): number => RangeSelectionService
      .getSelectionRange(RangeSelectionService.getRange() as Range, field).start;

    beforeEach(() => {
      keypadEvents = { select: new EventEmitter<string>() };
      directive.keypadService = {
        ...keypadEvents,
        enterKey: new EventEmitter<string>(),
        deleteCharacters: new EventEmitter<boolean>(),
        isOpen: true,
        toggleAsync: vi.fn().mockResolvedValue(true),
        close: vi.fn()
      } as unknown as KeypadService;
      vi.spyOn(CaretScroller, 'scrollIntoView').mockImplementation(() => {});
    });

    afterEach(() => {
      fields.splice(0).forEach(field => field.remove());
    });

    /* Behind the line break that keeps the area's last line open there is no line: the next character
       would open a second one (#1011). */
    it('should stop in front of the line break that keeps the last line open (#1011)', fakeAsync(() => {
      const segment = document.createElement('span');
      segment.contentEditable = 'true';
      segment.textContent = 'qw\n\n';

      pressArrow(segment, 3, 'ArrowDown');

      expect(caretOffset(segment)).toBe(3);
    }));

    it('should reach the end of a text part that a formula follows', fakeAsync(() => {
      const area = createFormulaArea('qw\n\n');
      fields.push(area.container);

      pressArrow(area.firstPart, 3, 'ArrowDown');

      expect(caretOffset(area.firstPart)).toBe(4);
    }));
  });

  /* Backspace that removes a formula takes the focused text part away, and the merged part is focused without
     a blur of the one before. That focus subscribed the keys a second time, so each key ran twice; a field that
     shows a key's text at once -- a text part of a formula area since #1710 -- got every character twice. */
  describe('key after a focus that followed no blur (#1710)', () => {
    let keys: { enterKey: EventEmitter<string>; deleteCharacters: EventEmitter<boolean>; select: EventEmitter<string> };

    const keyService = (): unknown => ({
      ...keys, isOpen: true, toggleAsync: vi.fn().mockResolvedValue(true), close: vi.fn()
    });

    /** Focuses the text field twice, as the merged text part is, and types one key. */
    const focusTwiceAndType = (elementModel: TextFieldElement): void => {
      const elementComponent = {
        elementModel,
        setElementValue: (value: string) => { inputElement.value = value; }
      } as unknown as TextInputComponentType;
      directive.elementModel = elementModel;
      directive.toggleKeyInput({ inputElement, focused: true }, elementComponent);
      flushMicrotasks();
      directive.toggleKeyInput({ inputElement, focused: true }, elementComponent);
      flushMicrotasks();
      keys.enterKey.emit('x');
    };

    beforeEach(() => {
      keys = { enterKey: new EventEmitter(), deleteCharacters: new EventEmitter(), select: new EventEmitter() };
    });

    it('should run a key of the on-screen keyboard once', fakeAsync(() => {
      directive.keyboardService = keyService() as KeyboardService;

      focusTwiceAndType(createTextField(5, false));

      expect(inputElement.value).toBe('x');
    }));

    it('should run a key of the keypad once', fakeAsync(() => {
      directive.keypadService = keyService() as KeypadService;
      const elementModel = createTextField(5, false);
      elementModel.inputAssistancePreset = 'numbers';
      elementModel.showSoftwareKeyboard = false;

      focusTwiceAndType(elementModel);

      expect(inputElement.value).toBe('x');
    }));
  });

  /* The keyboard and the keypad stay open from one field to the next, and pass a key on to the field that
     subscribed to them. That changed over only once they had opened again after their pause, so a key in
     between went to the field before -- the text of the next part of a formula area was written into the
     part the focus had moved to, and a removed formula's text part replaced the whole text (#1710). */
  describe('key right after a field has taken the focus (#1710)', () => {
    let keys: { enterKey: EventEmitter<string>; deleteCharacters: EventEmitter<boolean>; select: EventEmitter<string> };
    let nextField: HTMLInputElement;

    /** A text field element whose value writes only record what the keys would write. */
    const createTextFieldComponent = (written: string[]): TextInputComponentType => ({
      elementModel: createTextField(5, false),
      setElementValue: (value: string) => { written.push(value); }
    } as unknown as TextInputComponentType);

    const focus = (focusing: TestTextInputGroupDirective, field: HTMLElement,
                   elementComponent: TextInputComponentType): void => {
      focusing.elementModel = elementComponent.elementModel;
      focusing.toggleKeyInput({ inputElement: field, focused: true }, elementComponent);
    };

    beforeEach(() => {
      keys = { enterKey: new EventEmitter(), deleteCharacters: new EventEmitter(), select: new EventEmitter() };
      directive.keyboardService = {
        ...keys, isOpen: true, toggleAsync: vi.fn().mockResolvedValue(true), close: vi.fn()
      } as unknown as KeyboardService;
      inputElement.value = 'a';
      nextField = document.createElement('input');
      document.body.appendChild(nextField);
    });

    afterEach(() => {
      nextField.remove();
    });

    it('should hand a key to the next field of the element before the keyboard has opened again', fakeAsync(() => {
      const written: string[] = [];
      const elementComponent = createTextFieldComponent(written);
      focus(directive, inputElement, elementComponent);
      flushMicrotasks();

      focus(directive, nextField, elementComponent);
      keys.enterKey.emit('b');
      flushMicrotasks();

      expect(written).toEqual(['b']);
    }));

    it('should leave a key to the field of another element that has taken the focus', fakeAsync(() => {
      const other = createDirective();
      other.keyboardService = directive.keyboardService;
      const written: string[] = [];
      const writtenByOther: string[] = [];
      focus(directive, inputElement, createTextFieldComponent(written));
      flushMicrotasks();

      focus(other, nextField, createTextFieldComponent(writtenByOther));
      keys.enterKey.emit('b');
      flushMicrotasks();
      other.ngOnDestroy();

      expect(written).toEqual([]);
      expect(writtenByOther).toEqual(['b']);
    }));

    /* Two gaps of a cloze belong to one directive. Tapping one gap and right away the gap that had the focus
       before ends four pauses in a row. Each decided on the keys for the gap of its own focus or blur: the
       blur of the gap tapped again dropped the keys it had taken back, or the focus of the other one took
       them and got the text of the gap tapped again written into it. */
    it('should leave the keys with the gap tapped last while the pauses of the taps before end', fakeAsync(() => {
      const pauses: (() => void)[] = [];
      const keyboard = { ...keys, isOpen: true, close: vi.fn() } as unknown as KeyboardService;
      keyboard.toggleAsync = ({ focused }) => new Promise<boolean>(resolve => {
        pauses.push(() => {
          keyboard.isOpen = focused;
          resolve(focused);
        });
      });
      directive.keyboardService = keyboard;
      const writtenToFirst: string[] = [];
      const writtenToLast: string[] = [];
      const first = createTextFieldComponent(writtenToFirst);
      const last = createTextFieldComponent(writtenToLast);
      directive.toggleKeyInput({ inputElement: nextField, focused: false }, last);
      focus(directive, inputElement, first);
      directive.toggleKeyInput({ inputElement, focused: false }, first);
      focus(directive, nextField, last);

      // The blur of the gap tapped again closes the keyboard, the focus of the other gap opens it again
      pauses[0]();
      flushMicrotasks();
      pauses[1]();
      flushMicrotasks();
      keys.enterKey.emit('x');

      expect(writtenToFirst).toEqual([]);
      expect(writtenToLast).toEqual(['x']);
    }));

    /* A unit or page taken down within the pause of a focus left a toggle behind, which subscribed the keys
       afterwards; nothing ended that subscription any more. */
    it('should not subscribe the keys once taken down during the pause of a focus', fakeAsync(() => {
      const pauses: ((isOpen: boolean) => void)[] = [];
      const keyboard = {
        ...keys,
        isOpen: false,
        toggleAsync: () => new Promise<boolean>(resolve => { pauses.push(resolve); }),
        close: vi.fn()
      } as unknown as KeyboardService;
      directive.keyboardService = keyboard;
      focus(directive, inputElement, createTextFieldComponent([]));
      directive.ngOnDestroy();

      keyboard.isOpen = true;
      pauses[0](true);
      flushMicrotasks();

      expect(keys.enterKey.observed).toBe(false);
    }));

    describe('field restricted to the characters of its input assistance', () => {
      /** Focuses a restricted field while the keypad is still open for the given element. */
      const focusRestricted = (keypadOpenFor: TextInputComponentType | null, written: string[]): void => {
        const elementComponent = createTextFieldComponent(written);
        const elementModel = elementComponent.elementModel as TextFieldElement;
        elementModel.inputAssistancePreset = 'numbers';
        elementModel.restrictedToInputAssistanceChars = true;
        elementModel.showSoftwareKeyboard = false;
        directive.keypadService = {
          ...keys,
          isOpen: true,
          elementComponent: keypadOpenFor ?? elementComponent,
          toggleAsync: () => new Promise<boolean>(() => {}),
          close: vi.fn()
        } as unknown as KeypadService;
        focus(directive, nextField, elementComponent);
      };

      it('should not take a key of the keypad still open for another element', fakeAsync(() => {
        const written: string[] = [];
        focusRestricted(createTextFieldComponent([]), written);

        keys.enterKey.emit('x');

        expect(written).toEqual([]);
      }));

      it('should take a key of the keypad open for its own element at once', fakeAsync(() => {
        const written: string[] = [];
        focusRestricted(null, written);

        keys.enterKey.emit('1');

        expect(written).toEqual(['1']);
      }));
    });
  });

  describe('word count', () => {
    const createTextArea = (showWordCount: boolean, value: string): TextAreaComponent => ({
      elementModel: new TextAreaElement({
        type: 'text-area', id: 'text-area_1', rowCount: 3, showWordCount
      }),
      elementFormControl: new UntypedFormControl(value),
      wordCount: signal<number>(0)
    }) as unknown as TextAreaComponent;

    it('should count the value the text area starts with', () => {
      const textArea = createTextArea(true, 'eins zwei drei');

      directive.manageWordCount(textArea);

      expect(textArea.wordCount()).toBe(3);
    });

    it('should count again whenever the value changes', () => {
      const textArea = createTextArea(true, '');
      directive.manageWordCount(textArea);

      textArea.elementFormControl.setValue('eins zwei');

      expect(textArea.wordCount()).toBe(2);
    });

    it('should leave the counting to the WordCounter', () => {
      const count = vi.spyOn(WordCounter, 'count').mockReturnValue(42);
      const textArea = createTextArea(true, 'eins');

      directive.manageWordCount(textArea);

      expect(count).toHaveBeenCalledWith('eins');
      expect(textArea.wordCount()).toBe(42);
    });

    it('should not count a text area that shows no word count', () => {
      const textArea = createTextArea(false, 'eins zwei');
      directive.manageWordCount(textArea);

      textArea.elementFormControl.setValue('eins zwei drei');

      expect(textArea.wordCount()).toBe(0);
    });

    it('should stop counting once destroyed', () => {
      const textArea = createTextArea(true, 'eins');
      directive.manageWordCount(textArea);

      directive.ngOnDestroy();
      textArea.elementFormControl.setValue('eins zwei');

      expect(textArea.wordCount()).toBe(1);
    });
  });
});
