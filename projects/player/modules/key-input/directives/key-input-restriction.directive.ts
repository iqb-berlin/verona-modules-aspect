import {
  AfterViewInit, Directive, Input, OnDestroy
} from '@angular/core';

@Directive()
export abstract class KeyInputRestrictionDirective implements AfterViewInit, OnDestroy {
  @Input() inputElement!: HTMLElement;
  @Input() restrictToAllowedKeys!: boolean;
  @Input() hasArrowKeys!: boolean;
  @Input() hasReturnKey!: boolean;
  @Input() arrows!: string[];

  allowedKeys: string[] = [];

  ngAfterViewInit(): void {
    if (this.restrictToAllowedKeys) {
      this.inputElement.addEventListener('keydown', this.restrict.bind(this));
      this.inputElement.addEventListener('paste', KeyInputRestrictionDirective.preventPaste);
    }
  }

  private static preventPaste = (event: Event): void => {
    event.preventDefault();
  };

  private restrict(event: Event): void {
    const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
    // Prevent Dead keys
    if (['Dead', 'Process', 'Unidentified'].includes(keyboardEvent.key)) {
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
      if (!this.canEdit('Backspace')) {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (keyboardEvent.key === 'Delete') {
      if (!this.canEdit('Delete')) {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (!keyboardEvent || !this.allowedKeys.includes(keyboardEvent.key)) {
      event.preventDefault();
      event.stopPropagation();
    } else if (!this.canEdit(null)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  canEdit(deleteKey: 'Backspace' | 'Delete' | null): boolean {
    if (this.restrictToAllowedKeys &&
      (this.inputElement instanceof HTMLInputElement || this.inputElement instanceof HTMLTextAreaElement)
    ) {
      let selectionStart = this.inputElement.selectionStart || 0;
      let selectionEnd = this.inputElement.selectionEnd || 0;
      if (deleteKey === 'Backspace' && selectionStart === selectionEnd) {
        selectionStart -= 1;
      }
      if (deleteKey === 'Delete' && selectionStart === selectionEnd) {
        selectionEnd += 1;
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
