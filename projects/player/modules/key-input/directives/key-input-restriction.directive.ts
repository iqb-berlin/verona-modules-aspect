import {
  AfterViewInit, Directive, Input, OnDestroy
} from '@angular/core';

@Directive()
export abstract class KeyInputRestrictionDirective implements AfterViewInit, OnDestroy {
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
  @Input() restrictToAllowedKeys!: boolean;
  @Input() hasArrowKeys!: boolean;
  @Input() hasReturnKey!: boolean;
  @Input() arrows!: string[];

  allowedKeys: string[] = [];

  ngAfterViewInit(): void {
    if (this.inputElement && this.restrictToAllowedKeys) {
      this.inputElement.addEventListener('keydown', this.restrict.bind(this));
      this.inputElement.addEventListener('paste', KeyInputRestrictionDirective.preventPaste);
    }
  }

  private static preventPaste = (event: Event): void => {
    event.preventDefault();
  };

  private restrict(event: Event): void {
    const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
    // This Hack prevents the input of unidentified keys like '`'
    if (keyboardEvent.key === 'Unidentified') {
      this.inputElement.blur();
      setTimeout(() => this.inputElement.focus());
    } else if (this.arrows.includes(keyboardEvent.key)) {
      if (!this.hasArrowKeys) {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (keyboardEvent.key === 'Enter') {
      if (!this.hasReturnKey) {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (keyboardEvent.key === 'Backspace') {
      if (!this.canEdit(true)) {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (!keyboardEvent || !this.allowedKeys.includes(keyboardEvent.key)) {
      event.preventDefault();
      event.stopPropagation();
    } else if (!this.canEdit(false)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  canEdit(deleteKey: boolean): boolean {
    if (this.restrictToAllowedKeys) {
      let selectionStart = this.inputElement.selectionStart || 0;
      const selectionEnd = this.inputElement.selectionEnd || 0;
      if (deleteKey && selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      const selectedKeys = this.inputElement.value.substring(selectionStart, selectionEnd).split('');
      return selectedKeys.every(key => this.allowedKeys.includes(key));
    }
    return true;
  }

  ngOnDestroy(): void {
    this.inputElement.removeEventListener('keydown', this.restrict.bind(this));
    this.inputElement.removeEventListener('paste', KeyInputRestrictionDirective.preventPaste);
  }
}
