import {
  Directive, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[isDisabled]'
})
export class IsDisabledDirective implements OnChanges {
  @Input() isDisabled!: boolean;

  constructor(private ngControl : NgControl) {}

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => { // give time for form control to initialize
      if (changes.isDisabled && this.ngControl) {
        const action = changes.isDisabled.currentValue ? 'disable' : 'enable';
        this.ngControl?.control?.[action]();
      }
    });
  }
}
