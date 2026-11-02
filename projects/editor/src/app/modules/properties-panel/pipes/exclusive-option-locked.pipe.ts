import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether the box of one of two options that exclude each other is locked - "strike the other
 * options" and "strike the chosen option" of the toggle button (#1637).
 *
 * A box is locked while the other option is set on at least one selected element: `true`, or `null`
 * for a selection that disagrees. Locking only on `true` left a hole there - two toggle buttons set
 * the opposite way merge to `null` on both boxes, and a click on either wrote `true` to the element
 * that had the other one set.
 *
 * A ticked box is never locked, so a unit saved with both set shows two boxes that can still be
 * unticked rather than two locked ones. An `undefined` other option is one the selection does not
 * have at all - the radio group strikes other options but has no chosen option to strike - and
 * locks nothing.
 */
@Pipe({
  name: 'exclusiveOptionLocked',
  standalone: false
})
export class ExclusiveOptionLockedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(own: boolean | null | undefined, other: boolean | null | undefined): boolean {
    return own !== true && (other === true || other === null);
  }
}
