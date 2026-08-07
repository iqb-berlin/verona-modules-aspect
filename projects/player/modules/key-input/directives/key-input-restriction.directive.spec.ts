import { Directive } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { KeyInputRestrictionDirective } from './key-input-restriction.directive';

/* The directive is abstract, so it is tested through a minimal concrete subclass. */
@Directive()
class TestKeyInputRestrictionDirective extends KeyInputRestrictionDirective {}

describe('KeyInputRestrictionDirective', () => {
  let directive: TestKeyInputRestrictionDirective;
  let inputElement: HTMLInputElement;

  const initDirective = (restrictToAllowedKeys: boolean = true): void => {
    directive.inputElement = inputElement;
    directive.restrictToAllowedKeys = restrictToAllowedKeys;
    directive.hasArrowKeys = false;
    directive.hasReturnKey = false;
    directive.arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    directive.allowedKeys = ['a', 'b', 'c'];
    directive.ngAfterViewInit();
  };

  const keyDown = (key: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true });
    inputElement.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    directive = new TestKeyInputRestrictionDirective();
    inputElement = document.createElement('input');
    document.body.appendChild(inputElement);
  });

  afterEach(() => {
    inputElement.remove();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should allow an allowed key', () => {
    initDirective();

    expect(keyDown('a').defaultPrevented).toBe(false);
  });

  it('should block a key that is not allowed', () => {
    initDirective();

    expect(keyDown('x').defaultPrevented).toBe(true);
  });

  it('should block arrow keys without arrow key support', () => {
    initDirective();

    expect(keyDown('ArrowLeft').defaultPrevented).toBe(true);
  });

  it('should allow arrow keys with arrow key support', () => {
    initDirective();
    directive.hasArrowKeys = true;

    expect(keyDown('ArrowLeft').defaultPrevented).toBe(false);
  });

  it('should block the return key without return key support', () => {
    initDirective();

    expect(keyDown('Enter').defaultPrevented).toBe(true);
  });

  it('should allow the return key with return key support', () => {
    initDirective();
    directive.hasReturnKey = true;

    expect(keyDown('Enter').defaultPrevented).toBe(false);
  });

  it('should allow deleting an allowed character', () => {
    initDirective();
    inputElement.value = 'ab';
    inputElement.setSelectionRange(2, 2);

    expect(keyDown('Backspace').defaultPrevented).toBe(false);
  });

  it('should block deleting a character that is not allowed', () => {
    initDirective();
    inputElement.value = 'ax';
    inputElement.setSelectionRange(2, 2);

    expect(keyDown('Backspace').defaultPrevented).toBe(true);
  });

  it('should block deleting forwards over a character that is not allowed', () => {
    initDirective();
    inputElement.value = 'xa';
    inputElement.setSelectionRange(0, 0);

    expect(keyDown('Delete').defaultPrevented).toBe(true);
  });

  it('should block overwriting a selection that contains characters that are not allowed', () => {
    initDirective();
    inputElement.value = 'axb';
    inputElement.setSelectionRange(0, 3);

    expect(keyDown('a').defaultPrevented).toBe(true);
  });

  it('should refocus the input on dead keys', fakeAsync(() => {
    initDirective();
    const blur = vi.spyOn(inputElement, 'blur');
    const focus = vi.spyOn(inputElement, 'focus');

    keyDown('Dead');
    tick();

    expect(blur).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  }));

  it('should prevent pasting', () => {
    initDirective();
    const event = new ClipboardEvent('paste', { cancelable: true });

    inputElement.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('should stop restricting keys when destroyed', () => {
    initDirective();

    directive.ngOnDestroy();

    expect(keyDown('x').defaultPrevented).toBe(false);
  });

  it('should stop preventing pasting when destroyed', () => {
    initDirective();
    const event = new ClipboardEvent('paste', { cancelable: true });

    directive.ngOnDestroy();
    inputElement.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('should not restrict anything without key restriction', () => {
    initDirective(false);

    expect(keyDown('x').defaultPrevented).toBe(false);
  });

  it('should allow editing for element types without selection', () => {
    initDirective();
    directive.inputElement = document.createElement('div');

    expect(directive.canEdit(null)).toBe(true);
  });
});
