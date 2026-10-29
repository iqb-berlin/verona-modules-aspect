import { FormControl, Validators } from '@angular/forms';
import { NumberFieldErrorStateMatcher } from './number-field-error-state.matcher';

describe('NumberFieldErrorStateMatcher', () => {
  const matcher = new NumberFieldErrorStateMatcher();

  const emptyRequired = (): FormControl => new FormControl<number | null>(null, Validators.required);

  it('should not call an untouched box wrong', () => {
    expect(matcher.isErrorState(emptyRequired())).toBe(false);
  });

  /* The point of having a matcher of our own. Material's default goes red here, and the box is
     empty for reasons that are not the user's: a multi-selection whose values disagree shows an
     empty box, and clicking in and tabbing on is enough to mark it touched. */
  it('should not call a box wrong that was only visited', () => {
    const control = emptyRequired();
    control.markAsTouched();

    expect(matcher.isErrorState(control)).toBe(false);
  });

  it('should call an edited box wrong once it is', () => {
    const control = emptyRequired();
    control.markAsDirty();

    expect(matcher.isErrorState(control)).toBe(true);
  });

  it('should leave an edited box alone while its value is good', () => {
    const control = new FormControl<number | null>(5, Validators.required);
    control.markAsDirty();

    expect(matcher.isErrorState(control)).toBe(false);
  });

  it('should cope with no control at all', () => {
    expect(matcher.isErrorState(null)).toBe(false);
  });

  /* The last valid value is back and the box is valid and pristine, but it goes on saying why until typed in
     (#1523). */
  it('should call a box wrong while its directive says an entry was refused', () => {
    const refusing = new NumberFieldErrorStateMatcher();
    const control = new FormControl<number | null>(5, Validators.required);

    refusing.refused = true;
    expect(refusing.isErrorState(control)).toBe(true);

    refusing.refused = false;
    expect(refusing.isErrorState(control)).toBe(false);
  });

  it('should never call a disabled box wrong', () => {
    const refusing = new NumberFieldErrorStateMatcher();
    const control = new FormControl<number | null>(5, Validators.required);
    control.disable();

    refusing.refused = true;
    expect(refusing.isErrorState(control)).toBe(false);
  });
});
