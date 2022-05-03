import {
  AfterViewInit, Directive, Input, OnDestroy
} from '@angular/core';

@Directive()
export abstract class KeyInputRestrictionDirective implements AfterViewInit, OnDestroy {
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
  @Input() restrictToAllowedKeys!: boolean;
  allowedKeys: string[] = [];

  ngAfterViewInit(): void {
    if (this.inputElement && this.restrictToAllowedKeys) {
      this.inputElement.addEventListener('keydown', this.restrict.bind(this));
      this.inputElement.addEventListener('paste', this.preventPaste);
    }
  }

  private preventPaste = (event: Event): void => {
    event.preventDefault();
  };

  private restrict(event: Event): void {
    const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent ||
      (!this.allowedKeys.includes(keyboardEvent.key) && keyboardEvent.key !== 'Backspace')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  ngOnDestroy(): void {
    this.inputElement.removeEventListener('keydown', this.restrict.bind(this));
    this.inputElement.removeEventListener('paste', this.preventPaste);
  }
}
