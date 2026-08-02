import { Directive, ElementRef, forwardRef } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Makes text the browser could not read count as invalid, like any other refused entry.
 *
 * A number input reports unreadable text and an empty box as the same thing - no value at all.
 * `5e`, `1.2.3` or a decimal comma where the locale takes none leave `value` empty while the box
 * goes on showing what was typed. Only `validity.badInput` keeps the difference, and it lives on
 * the element rather than on the control, so nothing that reads the control alone can see it.
 *
 * Saying it as a validation error rather than as a special case in one place is what keeps the
 * three parties that ask "is this refused?" in step: `NumberFieldDirective` when the field is left,
 * the error state matcher while it is being typed in, and Material's own red border. Asked as a
 * one-off it was only ever true in the first of them - an unreadable entry sat there looking
 * accepted until the field was left, while the same keystrokes in a `required` box went red at once
 * (#1161).
 *
 * A directive of its own, on the same selector, because the validator has to reach `NgModel` before
 * `NgModel` is built: `NumberFieldDirective` injects `NgModel`, so it cannot also be one of the
 * validators `NgModel` collects without a cycle.
 */
@Directive({
  selector: 'input[type=number][ngModel][aspectNumberField]',
  standalone: false,
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => NumberFieldBadInputDirective),
    multi: true
  }]
})
export class NumberFieldBadInputDirective implements Validator {
  constructor(private element: ElementRef<HTMLInputElement>) {}

  validate(): ValidationErrors | null {
    return this.element.nativeElement.validity.badInput ? { badInput: true } : null;
  }
}
