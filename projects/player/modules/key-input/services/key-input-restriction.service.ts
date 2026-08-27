import { Injectable } from '@angular/core';
import { ARROW_KEYS } from 'player/modules/key-input/configs/key-layout';

export interface KeyInputRestriction {
  allowedKeys: string[];
  hasArrowKeys: boolean;
  hasReturnKey: boolean;
}

/** Enforces `restrictedToInputAssistanceChars` on the focused field.
 *
 * It hangs on the field, not on the input assistance: the keypad opens 100 ms after the focus
 * (`KeypadService.toggleAsync`, debouncing its animation) and registered the keydown listener only
 * once its view existed. Everything typed until then reached the field unchecked, so a fast typist
 * could put forbidden characters into a restricted field -- and `canEdit` then refused to delete
 * them again, because they are not among the allowed keys (#1143).
 *
 * One field is focused at a time, hence one attachment: `attach` replaces whatever was attached
 * before. */
@Injectable({
  providedIn: 'root'
})
export class KeyInputRestrictionService {
  private inputElement?: HTMLElement;
  private restriction?: KeyInputRestriction;

  /**
   * Bound once: `bind` returns a new function every call, so the reference passed to
   * removeEventListener would never be the one that had been registered and the keydown listener
   * would stay on the input for its lifetime (#1123).
   */
  private readonly restrictKeys = this.restrict.bind(this);

  attach(inputElement: HTMLElement, restriction: KeyInputRestriction): void {
    this.detach();
    this.inputElement = inputElement;
    this.restriction = restriction;
    inputElement.addEventListener('keydown', this.restrictKeys);
    inputElement.addEventListener('paste', KeyInputRestrictionService.preventPaste);
  }

  /** Only releases the field it was attached to: a component being torn down must not cancel the
     restriction of the field that has meanwhile taken the focus. */
  detachFrom(inputElement?: HTMLElement): void {
    if (inputElement && this.inputElement === inputElement) this.detach();
  }

  detach(): void {
    if (!this.inputElement) return;
    this.inputElement.removeEventListener('keydown', this.restrictKeys);
    this.inputElement.removeEventListener('paste', KeyInputRestrictionService.preventPaste);
    this.inputElement = undefined;
    this.restriction = undefined;
  }

  /** Whether the current selection may be changed at all: content that could not have been typed is
     the preset value of the field and stays protected. Also used by the keypad for its own keys. */
  canEdit(deleteKey: 'Backspace' | 'Delete' | null): boolean {
    const { restriction } = this;
    if (!restriction ||
      !(this.inputElement instanceof HTMLInputElement || this.inputElement instanceof HTMLTextAreaElement)
    ) {
      return true;
    }
    let selectionStart = this.inputElement.selectionStart || 0;
    let selectionEnd = this.inputElement.selectionEnd || 0;
    if (deleteKey === 'Backspace' && selectionStart === selectionEnd) {
      selectionStart -= 1;
    }
    if (deleteKey === 'Delete' && selectionStart === selectionEnd) {
      selectionEnd += 1;
    }
    const selectedKeys = this.inputElement.value.substring(selectionStart, selectionEnd).split('');
    return selectedKeys.every(key => restriction.allowedKeys.includes(key));
  }

  private static preventPaste = (event: Event): void => {
    event.preventDefault();
  };

  private restrict(event: Event): void {
    const { restriction, inputElement } = this;
    if (!restriction || !inputElement) return;
    const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
    // Prevent Dead keys
    if (['Dead', 'Process', 'Unidentified'].includes(keyboardEvent.key)) {
      inputElement.blur();
      setTimeout(() => inputElement.focus());
    } else if (ARROW_KEYS.includes(keyboardEvent.key)) {
      if (!restriction.hasArrowKeys) KeyInputRestrictionService.block(event);
    } else if (keyboardEvent.key === 'Enter') {
      if (!restriction.hasReturnKey) KeyInputRestrictionService.block(event);
    } else if (keyboardEvent.key === 'Backspace') {
      if (!this.canEdit('Backspace')) KeyInputRestrictionService.block(event);
    } else if (keyboardEvent.key === 'Delete') {
      if (!this.canEdit('Delete')) KeyInputRestrictionService.block(event);
    } else if (!restriction.allowedKeys.includes(keyboardEvent.key)) {
      KeyInputRestrictionService.block(event);
    } else if (!this.canEdit(null)) {
      KeyInputRestrictionService.block(event);
    }
  }

  private static block(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
