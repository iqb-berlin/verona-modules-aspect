import { ElementRef } from '@angular/core';
import { NumberFieldBadInputDirective } from './number-field-bad-input.directive';

/**
 * The contract only: what the directive answers for a given `validity.badInput`.
 *
 * That a browser sets the flag for `5e` at all, that it clears it again when the box is written to,
 * and that the red border and the refusal follow from it - none of that can be shown here, because
 * `badInput` is only ever set by real typing. Those are in the directive spec next door, under
 * "with text the browser cannot read".
 */
describe('NumberFieldBadInputDirective', () => {
  const withBadInput = (badInput: boolean): NumberFieldBadInputDirective => new NumberFieldBadInputDirective(
    new ElementRef({ validity: { badInput } } as HTMLInputElement)
  );

  it('should report an error for text the browser could not read', () => {
    expect(withBadInput(true).validate()).toEqual({ badInput: true });
  });

  it('should stay out of the way otherwise', () => {
    expect(withBadInput(false).validate()).toBeNull();
  });
});
