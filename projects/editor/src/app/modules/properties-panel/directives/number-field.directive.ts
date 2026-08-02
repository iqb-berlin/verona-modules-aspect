import {
  booleanAttribute, Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Self
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

/**
 * What a number field in the properties panel has to do beyond binding a value, in one place.
 *
 * The panel had this written out six times after #1154 - four copies of `commitNumber`, two of
 * `revertIfInvalid` - and eleven further fields still carried the broken version it replaced
 * (#1161). Three rules, none of them obvious, and each was got wrong somewhere:
 *
 * - **Emit only a value that is there.** A number input passes through states the accessor reports
 *   as null while it is being typed: an empty box, or a lone `-` the browser cannot parse yet.
 *   Writing then means the value comes straight back through the model and stamps over what is
 *   being typed - typing `-2` used to give `2`.
 * - **An empty box means zero, on leaving.** For properties declared `number` only; where the model
 *   says `number | null`, an empty box is the legitimate "no limit" and stays empty. Hence
 *   `emptyMeansZero`, which the caller sets from its own model type.
 * - **Put a refused value back.** An invalid entry is not written, so the model still holds the old
 *   value and the box has to follow, or it goes on showing a number that was never saved.
 *
 * The refusal is reported once, on leaving, rather than per keystroke: typing `-50` passes through
 * `-5`, and a warning each put one after the other on screen for a single edit.
 *
 * What to do with either outcome is the caller's business - emit it up to the host, or write it to
 * a service - so both leave through `numberChange` carrying the same `isInputValid` the panel's
 * guards already speak.
 */
@Directive({
  selector: 'input[type=number][ngModel][aspectNumberField]',
  standalone: false
})
export class NumberFieldDirective implements OnInit, OnDestroy {
  /**
   * Whether an emptied box means 0 (the property is declared `number`) or stays empty (it is
   * `number | null`, where empty says "no limit" / "no preset" / "no maximum").
   */
  @Input({ transform: booleanAttribute }) emptyMeansZero: boolean = false;

  /**
   * A value the caller should act on. `isInputValid` is false only for a refused entry, where the
   * caller is expected to warn rather than write - the box has been put back already.
   */
  @Output() numberChange = new EventEmitter<{ value: number; isInputValid: boolean }>();

  private ngUnsubscribe = new Subject<void>();

  constructor(@Self() private ngModel: NgModel) {}

  /** What the model holds, i.e. the value bound through `[ngModel]`, untouched by typing. */
  private get modelValue(): number | null {
    return (this.ngModel.model ?? null) as number | null;
  }

  ngOnInit(): void {
    this.ngModel.update
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: number | null) => {
        if (value !== null && this.ngModel.valid) this.numberChange.emit({ value, isInputValid: true });
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /** The field has been left - `change` fires on blur, and only if the value actually changed. */
  @HostListener('change')
  onCommit(): void {
    const control = this.ngModel.control;
    if (control.invalid) {
      this.numberChange.emit({ value: control.value as number, isInputValid: false });
      /* `emitViewToModelChange: false` says this write is not the user typing, so it does not go
         back out through `ngModel.update`.

         Measured, because it matters for anyone changing the guard above: the flag is currently
         belt and braces. `setValue` runs the view callbacks before `updateValueAndValidity`, so at
         the moment the re-emit would happen the control still carries the invalid status and the
         `valid` guard drops it anyway - taking the flag out breaks no test. It stays because it
         states the intent, and because the guard is the only thing holding the line without it. */
      control.setValue(this.modelValue, { emitViewToModelChange: false, emitEvent: false });
      return;
    }
    if (control.value === null && this.emptyMeansZero) {
      this.numberChange.emit({ value: 0, isInputValid: true });
    }
  }
}
