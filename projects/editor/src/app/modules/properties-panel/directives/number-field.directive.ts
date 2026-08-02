import {
  Directive, EventEmitter, HostListener, OnDestroy, OnInit, Output, Self
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

/**
 * What a number field in the properties panel has to do beyond binding a value, in one place.
 *
 * The panel had this written out six times after #1154 - four copies of `commitNumber`, two of
 * `revertIfInvalid` - and eleven further fields still carried the broken version it replaced
 * (#1161). Two rules, neither obvious, and each was got wrong somewhere:
 *
 * - **Report only a value that is there.** A number input passes through states the accessor reports
 *   as null while it is being typed: an empty box, or a lone `-` the browser cannot parse yet.
 *   Reporting then means the value comes straight back through the model and stamps over what is
 *   being typed - typing `-2` used to give `2`.
 * - **Put a refused value back.** A refused entry is not written, so the model still holds the old
 *   value and the box has to follow, or it goes on showing a number that was never saved.
 *
 * An empty box is refused like any other invalid entry, unless the property it is bound to takes
 * null for an answer. Which of the two a box is, is what `required` says on the element - so the
 * rule is written where the field is, in the same place as `min` and `max`, and the directive has
 * nothing to configure.
 *
 * That is a change of mind, and worth recording. Until #1161 an emptied box stood for a substitute
 * value - 0, or 1 for a grid span - which the directive wrote into the model and back into the box
 * on leaving. Four rounds of review each found another way for that to go wrong, because the
 * substitute is a value the user never typed: it has to be chosen per call site, written twice
 * (model and box, which drift apart), and told apart from the browser's bad input. An empty box is
 * simply not a number, and refusing it costs none of that.
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
   * A value the caller should act on. `isInputValid` is false only for a refused entry, where the
   * caller is expected to warn rather than write - the box has been put back already.
   *
   * `value` is null only where the box is allowed to be empty, i.e. where the element carries no
   * `required`. A `required` box never reports null as valid, so a caller writing into a property
   * declared `number` can narrow on it rather than substitute a number of its own.
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
    /* The one misuse the selector cannot rule out, so it is ruled out here: `[(ngModel)]` and a
       lone `(ngModelChange)` both leave `update` observed, and both defeat the write-back above.
       Checked before subscribing, because the subscription below would make it true itself. */
    if (this.ngModel.update.observed) {
      throw new Error(
        'aspectNumberField needs a one-way [ngModel] and reports through (numberChange): ' +
        'with [(ngModel)] or (ngModelChange) a refused value has already reached the caller.'
      );
    }

    this.ngModel.update
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: number | null) => {
        /* An empty box is never reported on the keystroke, whichever kind of field this is. Where
           it is refused there is nothing to report until the user is done; where it is a value in
           its own right, reporting it mid-edit would clear the property under the box being typed
           in - and the panel hangs decisions off that null, a cleared limit unticks its checkbox
           and disables the very field. Both are settled on leaving. */
        if (value !== null && this.ngModel.valid) this.numberChange.emit({ value, isInputValid: true });
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * The field has been left, which is where an empty box is answered for.
   *
   * On `blur` rather than `change`, and guarded by `dirty` instead: `change` does not fire when the
   * value at blur equals the value at focus, so typing a number into an empty box and clearing it
   * again reported the number and never the clearing - measured against a real browser, not
   * assumed. `dirty` is what tells an edit from tabbing through, and it has to be put back
   * afterwards or every further blur would answer for the same edit again.
   */
  @HostListener('blur')
  onLeave(): void {
    const control = this.ngModel.control;
    if (control.pristine) return;

    if (control.invalid) {
      this.numberChange.emit({ value: control.value as number | null, isInputValid: false });
      this.writeBack(this.modelValue);
    } else if (control.value === null) {
      /* Empty where empty is allowed: the property is cleared. Into the box as well, because the
         box is not necessarily empty - `1e` or `--` is bad input, which the browser reports as no
         value while it goes on showing the raw text. */
      this.writeBack(null);
      this.numberChange.emit({ value: null, isInputValid: true });
    }

    control.markAsPristine();
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
   * Reachable, and pinned by a test: clear a width that reads 0, leave the field - the entry is
   * refused and 0 goes back into the box - then add an element of a different width to the
   * selection. The merge yields null for "the selection disagrees", `viewModel` is still the null
   * from typing, the two match, and the box goes on showing 0 where it has to be empty, ready to
   * write that 0 onto both elements.
   */
  private writeBack(value: number | null): void {
    this.ngModel.control.setValue(value, { emitViewToModelChange: false, emitEvent: false });
    this.ngModel.viewModel = value;
  }
}
