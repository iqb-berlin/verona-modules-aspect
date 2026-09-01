import {
  Directive, EventEmitter, HostListener, isDevMode, OnDestroy, OnInit, Output, Self
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { NumberFieldErrorStateMatcher } from './number-field-error-state.matcher';

/* How long a step waits for the next one. Clicking an arrow four times is one edit from 2 to 6, and
   applying each step on its way there is what the waiting is for: a count that is applied slices the
   sizes below it, so stepping down and back up would refill the row that was cut with a default
   height. Long enough for a rhythm of clicks, short enough that a single one looks immediate. */
const STEP_COMMIT_DELAY = 300;

/**
 * What a number field in the editor has to do beyond binding a value, in one place.
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
 * The refusal is reported once, when the edit ends - by leaving the field or by pressing Enter -
 * rather than per keystroke: typing `-50` passes through `-5`, and a warning each put one after the
 * other on screen for a single edit.
 *
 * What to do with either outcome is the caller's business - emit it up to the host, or write it to
 * a service - so both leave through `numberChange` carrying the same `isInputValid` the panel's
 * guards already speak.
 */
@Directive({
  selector: 'input[type=number][ngModel][aspectNumberField]',
  standalone: false,
  /* On the element, so it reaches the MatInput sitting next to it and nothing else: an empty box
     goes red once it has been typed in, not merely visited. See the matcher for why. */
  providers: [{ provide: ErrorStateMatcher, useClass: NumberFieldErrorStateMatcher }]
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

  /**
   * The edit is over and the box holds a number: leaving the field, Enter, or a step on the field's
   * own arrows.
   *
   * For the fields that hold their entry back until the edit ends -- a count, a size -- because
   * applying every keystroke would cut a table down to the first digit of a two-digit number
   * (#1164). They used to hang that on `(blur)` and `(keydown.enter)` themselves, which left the
   * arrows out: Firefox does not focus the box when they are clicked, so no blur ever follows and
   * the new count was never applied; in Chrome it waited for the field to be left (#1433).
   *
   * It says nothing about the value, which has already come through `numberChange`, and it does not
   * fire for an entry that was refused there.
   */
  @Output() numberCommit = new EventEmitter<void>();

  private ngUnsubscribe = new Subject<void>();

  /** Steps on the field's own arrows, waiting to see whether another one follows. */
  private stepped = new Subject<void>();

  /**
   * Set when the call site binds two-way, which leaves the directive unable to do its job. See
   * `ngOnInit`: in a built editor that is logged rather than thrown, and the directive then keeps
   * out of the way entirely.
   */
  private isMisused = false;

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
       Checked before subscribing, because the subscription below would make it true itself.

       Thrown while developing, where it fires on the first render of the offending template and
       cannot be missed - but only logged in the built editor, because a template that slipped
       through would otherwise take the whole panel or dialog down for the user.

       And then the directive stands down rather than half working. Carrying on would be worse than
       doing nothing: `modelValue` reads what the banana box has already written, so the write-back
       would put the refused value into the box while the caller is being told it was refused, and
       the model would keep it too. Standing down leaves the field behaving as it did before the
       directive was put on it. */
    if (this.ngModel.update.observed) {
      const misuse = 'aspectNumberField needs a one-way [ngModel] and reports through (numberChange): ' +
        'with [(ngModel)] or (ngModelChange) a refused value has already reached the caller.';
      if (isDevMode()) throw new Error(misuse);
      // eslint-disable-next-line no-console -- a built editor has nowhere else to say this
      console.error(misuse);
      this.isMisused = true;
      return;
    }

    this.stepped
      .pipe(debounceTime(STEP_COMMIT_DELAY), takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.numberCommit.emit());

    this.ngModel.update
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: number | null) => {
        /* An empty box is never reported on the keystroke, whichever kind of field this is. Where
           it is refused there is nothing to report until the user is done; where it is a value in
           its own right, reporting it mid-edit would clear the property under the box being typed
           in - and the panel hangs decisions off that null, a cleared limit unticks its checkbox
           and disables the very field. Both are settled once the edit ends, see `settle`. */
        if (value !== null && this.ngModel.valid) this.numberChange.emit({ value, isInputValid: true });
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * The field has been left, which is one of the two ways an edit ends.
   *
   * On `blur` rather than `change`: `change` does not fire when the value at blur equals the value at
   * focus, so typing a number into an empty box and clearing it again reported the number and never
   * the clearing - measured against a real browser, not assumed.
   */
  @HostListener('blur')
  onLeave(): void {
    this.settle();
  }

  /**
   * And the other: Enter confirms an entry where it stands, without the focus going anywhere.
   *
   * It has to answer for the entry here too, because the call sites hang their write on Enter as
   * well and nothing else along that path speaks for an emptied box - the directive stays silent per
   * keystroke by design, so a refusal reported only on `blur` was simply skipped. Typing a number
   * into a field and deleting it again, then pressing Enter, wrote the deleted number to the model:
   * a wrong measurement in the size panel, and lost rows or columns where the number is a count
   * (#1169).
   *
   * On `keydown` rather than `keyup`, so that it runs before the call site's own
   * `(keydown.enter)` - see `settle` for why that order is the whole point.
   *
   * It answers for a box that may legitimately be empty as well, i.e. it clears the property rather
   * than only reporting refusals. Asked in review, and deliberate: the reason the clearing waits at
   * all is the *keystroke* that empties a box on the way to another number, where writing null would
   * pull the field out from under what is being typed. Enter is not that - it says the edit is
   * finished. Clearing a limit does take its field away, because the checkbox above reads the model
   * and disables the box the caret is in, but that is the state the author asked for and the same one
   * a blur produces; the checkbox leads back in, and nothing stays focused. Pinned in
   * `dimension-field-set.component.spec.ts`.
   */
  @HostListener('keydown.enter')
  onConfirm(): void {
    this.settle();
  }

  /**
   * And the third: the arrows the browser draws on the field, which step the value by themselves.
   *
   * A step is a finished edit -- there is no half-typed state to wait out -- and waiting for a blur
   * does not work anyway: Firefox leaves the focus where it was when the arrows are clicked, so a
   * field that is only committed on leaving it would never be committed at all (#1433).
   *
   * `change` is the event that says so and nothing else does: on a number field it fires for a step,
   * and otherwise only where the edit was going to end anyway -- on leaving the field or on Enter,
   * never per keystroke. A box that was emptied is not committed here: it arrives as null and is
   * refused a moment later, in `settle`, on the blur that follows.
   *
   * A step waits for the next one, see `STEP_COMMIT_DELAY`, because four clicks from 2 to 6 are one
   * edit and not four; leaving the field or pressing Enter still commits at once.
   */
  @HostListener('change')
  onStep(): void {
    if (this.isMisused) return;
    const control = this.ngModel.control;
    if (control.valid && control.value !== null) this.stepped.next();
  }

  /**
   * Answer for what is in the box, which is where an empty one is refused.
   *
   * Guarded by `dirty`, which is what tells an edit from tabbing through, and it has to be put back
   * afterwards or every further blur would answer for the same edit again. That also settles what
   * happens when an entry is confirmed with Enter and the field is then left: the edit has been
   * answered for, so the blur finds nothing to do and no second warning follows.
   *
   * The call sites remember the last valid entry and write it when the field is left or Enter is
   * pressed, so this has to run *first* on both paths - a refusal reported afterwards would arrive
   * to find the refused value already written. Both listeners above are host listeners on the
   * element, which Angular registers while creating the directive, i.e. before the listeners the
   * template binds on the same element. Pinned by the call site's tests, not by this note.
   */
  private settle(): void {
    if (this.isMisused) return;

    const control = this.ngModel.control;
    if (control.pristine) return;

    /* Text the browser could not read counts as invalid here, which is not something the control
       knows by itself - `NumberFieldBadInputDirective` puts it there, so that this, the red border
       and Material all read the same answer. */
    if (control.invalid) {
      this.numberChange.emit({ value: control.value as number | null, isInputValid: false });
      this.writeBack(this.modelValue);
    } else if (control.value === null) {
      /* Empty where empty is allowed: the property is cleared. Written into the box as well, not
         only reported - the model may already hold null, and then nothing else would put the box
         straight. */
      this.writeBack(null);
      this.numberChange.emit({ value: null, isInputValid: true });
    } else {
      /* An entry that stands: the fields that held it back until now may write it. Where the edit
         ended by leaving the field or by Enter the browser has usually said `change` a moment
         earlier, and the callers act on the same pending value twice, which is why they are written
         to take it once. */
      this.numberCommit.emit();
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
