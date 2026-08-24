import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { KeyInputRestrictionService } from './key-input-restriction.service';

describe('KeyInputRestrictionService', () => {
  let service: KeyInputRestrictionService;
  let inputElement: HTMLInputElement;

  const attach = (overrides: { hasArrowKeys?: boolean; hasReturnKey?: boolean } = {}): void => {
    service.attach(inputElement, {
      allowedKeys: ['a', 'b', 'c'],
      hasArrowKeys: overrides.hasArrowKeys ?? false,
      hasReturnKey: overrides.hasReturnKey ?? false
    });
  };

  const keyDown = (key: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true });
    inputElement.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyInputRestrictionService);
    inputElement = document.createElement('input');
    document.body.appendChild(inputElement);
  });

  afterEach(() => {
    service.detach();
    inputElement.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow an allowed key', () => {
    attach();

    expect(keyDown('a').defaultPrevented).toBe(false);
  });

  it('should block a key that is not allowed', () => {
    attach();

    expect(keyDown('x').defaultPrevented).toBe(true);
  });

  it('should block arrow keys without arrow key support', () => {
    attach();

    expect(keyDown('ArrowLeft').defaultPrevented).toBe(true);
  });

  it('should allow arrow keys with arrow key support', () => {
    attach({ hasArrowKeys: true });

    expect(keyDown('ArrowLeft').defaultPrevented).toBe(false);
  });

  it('should block the return key without return key support', () => {
    attach();

    expect(keyDown('Enter').defaultPrevented).toBe(true);
  });

  it('should allow the return key with return key support', () => {
    attach({ hasReturnKey: true });

    expect(keyDown('Enter').defaultPrevented).toBe(false);
  });

  it('should allow deleting an allowed character', () => {
    attach();
    inputElement.value = 'ab';
    inputElement.setSelectionRange(2, 2);

    expect(keyDown('Backspace').defaultPrevented).toBe(false);
  });

  it('should block deleting a character that is not allowed', () => {
    attach();
    inputElement.value = 'ax';
    inputElement.setSelectionRange(2, 2);

    expect(keyDown('Backspace').defaultPrevented).toBe(true);
  });

  it('should block deleting forwards over a character that is not allowed', () => {
    attach();
    inputElement.value = 'xa';
    inputElement.setSelectionRange(0, 0);

    expect(keyDown('Delete').defaultPrevented).toBe(true);
  });

  it('should block overwriting a selection that contains characters that are not allowed', () => {
    attach();
    inputElement.value = 'axb';
    inputElement.setSelectionRange(0, 3);

    expect(keyDown('a').defaultPrevented).toBe(true);
  });

  it('should refocus the input on dead keys', fakeAsync(() => {
    attach();
    const blur = vi.spyOn(inputElement, 'blur');
    const focus = vi.spyOn(inputElement, 'focus');

    keyDown('Dead');
    tick();

    expect(blur).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  }));

  it('should prevent pasting', () => {
    attach();
    const event = new ClipboardEvent('paste', { cancelable: true });

    inputElement.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('should stop restricting keys when detached', () => {
    attach();

    service.detach();

    expect(keyDown('x').defaultPrevented).toBe(false);
  });

  it('should stop preventing pasting when detached', () => {
    attach();
    const event = new ClipboardEvent('paste', { cancelable: true });

    service.detach();
    inputElement.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('should not restrict anything before being attached', () => {
    expect(keyDown('x').defaultPrevented).toBe(false);
  });

  /* One field is focused at a time: attaching to the next one must not leave the previous one
     restricted, otherwise a field keeps blocking keys after the focus has left it. */
  it('should release the previous input when attached to another one', () => {
    attach();
    const nextInput = document.createElement('input');
    document.body.appendChild(nextInput);

    service.attach(nextInput, { allowedKeys: ['a'], hasArrowKeys: false, hasReturnKey: false });

    expect(keyDown('x').defaultPrevented).toBe(false);
    nextInput.remove();
  });

  it('should release the field it is attached to', () => {
    attach();

    service.detachFrom(inputElement);

    expect(keyDown('x').defaultPrevented).toBe(false);
  });

  /* A component being torn down must not cancel the restriction of the field that has meanwhile
     taken the focus. */
  it('should keep the restriction when released with another field', () => {
    attach();

    service.detachFrom(document.createElement('input'));

    expect(keyDown('x').defaultPrevented).toBe(true);
  });

  it('should allow editing for element types without selection', () => {
    service.attach(document.createElement('div'), {
      allowedKeys: ['a'], hasArrowKeys: false, hasReturnKey: false
    });

    expect(service.canEdit(null)).toBe(true);
  });
});
