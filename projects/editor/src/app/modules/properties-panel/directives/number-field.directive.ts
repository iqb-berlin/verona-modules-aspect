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
 * - **An emptied box is written on leaving**, as 0 where the property is declared `number` and as
 *   `null` where it is `number | null` and empty means "no limit". Hence `emptyMeansZero`, which
 *   the caller sets from its own model type. Both cases have to be sent: skipping the `null` one
 *   would mean a limit, once set, could never be cleared again.
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
   * What an emptied box means: 0 where the property is declared `number`, `null` where it is
   * `number | null` and empty says "no limit" / "no preset" / "no maximum". Either way it is sent
   * on leaving the field - clearing a box is an edit and has to reach the model, or a limit once
   * set could never be taken off again.
   *
   * Required on purpose, with no default: of the fields this replaces all but the two length limits
   * are `number`, so a default would be right most of the time and silently wrong the rest - and
   * wrong here means writing `null` into a non-nullable property, the very defect of #1154. Making
   * it a decision per call site costs one attribute and cannot be skipped by accident.
   */
  @Input({ required: true, transform: booleanAttribute }) emptyMeansZero!: boolean;

  /**
   * A value the caller should act on. `isInputValid` is false only for a refused entry, where the
   * caller is expected to warn rather than write - the box has been put back already.
   *
   * Bind this instead of `(ngModelChange)`, not next to it: the directive listens on the same
   * update, so a call site that keeps both writes everything twice.
   */
  @Output() numberChange = new EventEmitter<{ value: number | null; isInputValid: boolean }>();

  private ngUnsubscribe = new Subject<void>();

  constructor(@Self() private ngModel: NgModel) {}

  /**
   * What the model holds, i.e. the value bound through `[ngModel]`, untouched by typing.
   *
   * This is why the binding has to be one-way. The selector matches two other shapes and neither
   * works: with a bare `ngModel` there is no bound value, so a refused entry would clear the box
   * instead of restoring it; with `[(ngModel)]` the banana box has already written the refused
   * value into the parent, so the directive would "restore" exactly what it just rejected.
   */
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
      this.numberChange.emit({ value: control.value as number | null, isInputValid: false });
      this.writeBack(this.modelValue);
      return;
    }
    if (control.value === null) {
      const substitute = this.emptyMeansZero ? 0 : null;
      /* Into the box as well, not just out to the caller. Writing the value does not necessarily
         bring it back: if the model already holds it, the bound expression does not change,
         `ngOnChanges` never fires, and the box would stay empty over a property that reads 0 -
         an x position at 0 is the everyday case.
         It also settles what the browser calls bad input. `1e` or `--` make `input.value` read as
         empty while the box goes on showing the raw text, so without this the model would take the
         substitute and the screen would keep `1e` - the same mismatch the branch above exists to
         undo. */
      this.writeBack(substitute);
      this.numberChange.emit({ value: substitute, isInputValid: true });
    }
  }

  /**
   * Put a value into the box without it counting as user input.
   *
   * `emitViewToModelChange: false` keeps the write from going back out through `ngModel.update`,
   * but it also skips the only place that maintains `NgModel.viewModel`. That matters later:
   * `ngOnChanges` decides whether to redraw by comparing the incoming value against `viewModel`,
   * so once the two have drifted apart, a binding change that happens to equal the stale
   * `viewModel` is read as "nothing changed" and the box is never rewritten.
   *
   * Reachable, and pinned by a test: clear a width that already reads 0 and leave the field, then
   * add an element of a different width to the selection. The merge yields null for "the selection
   * disagrees", `viewModel` is still the null from typing, the two match - and the box goes on
   * showing 0 where it has to be empty, ready to write that 0 onto both elements.
   *
   * One asymmetry worth knowing before changing the guard in `ngOnInit`: for the refused value the
   * flag is belt and braces, because `setValue` runs the view callbacks before
   * `updateValueAndValidity` and the control still reads invalid when the re-emit would happen, so
   * the validity guard drops it anyway. For the substitute it is load-bearing - that value is
   * valid, and without the flag it would go straight back out as a second edit.
   */
  private writeBack(value: number | null): void {
    this.ngModel.control.setValue(value, { emitViewToModelChange: false, emitEvent: false });
    this.ngModel.viewModel = value;
  }
}
