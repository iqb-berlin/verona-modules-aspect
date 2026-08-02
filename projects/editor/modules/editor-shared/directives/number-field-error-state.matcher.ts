import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * When a number field is allowed to look wrong: once it has been edited, not merely visited.
 *
 * Material's default marks a field red as soon as it is invalid and `touched`, and `touched` is set
 * by leaving it - clicking in and tabbing on is enough. That is fine where empty means nothing was
 * filled in, but the number boxes behind `aspectNumberField` are `required` for a different reason:
 * they are bound to properties that hold a number, and the box is empty whenever the panel has no
 * single value to show. Select two elements of different widths and the merge answers null for
 * "they disagree" - a legitimately empty box that would turn red on the way past, claiming a
 * mistake nobody made (#1161).
 *
 * `dirty` says the box was typed in, which is exactly when an empty one is the user's doing and
 * worth pointing at. It is also what the directive uses to decide whether leaving the field has
 * anything to answer for, and it clears the marker afterwards - so the red is live feedback while
 * an entry that would be refused stands in the box, and it goes when the entry does: leaving the
 * field puts the old value back, and the warning that follows says more than a red border can.
 *
 * Provided by the directive itself, on the element - MatInput reads its default matcher from the
 * same node injector, so this reaches the boxes that carry the directive and nothing else.
 */
@Injectable()
export class NumberFieldErrorStateMatcher implements ErrorStateMatcher {
  // eslint-disable-next-line class-methods-use-this
  isErrorState(control: AbstractControl | null): boolean {
    return !!control && control.invalid && control.dirty;
  }
}
