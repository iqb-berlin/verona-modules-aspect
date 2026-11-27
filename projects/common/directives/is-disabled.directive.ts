import {
  Directive, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[isDisabled]',
  standalone: false
})
export class IsDisabledDirective implements OnChanges {
  @Input() isDisabled!: boolean;

  constructor(private ngControl : NgControl) {}

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => { // give time for form control to initialize
      if (changes.isDisabled && this.ngControl) {
        const action = changes.isDisabled.currentValue ? 'disable' : 'enable';
        // Silent: announced as a value change, it reached the host as an answer, and an element nobody
        // had touched was reported as VALUE_CHANGED (#1732). The view follows the state either way.
        this.ngControl?.control?.[action]({ emitEvent: false });
      }
    });
  }
}
