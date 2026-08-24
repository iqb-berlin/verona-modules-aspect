import { Pipe, PipeTransform } from '@angular/core';

/**
 * The state of the checkbox in front of a nullable number field - "limit the maximum width",
 * "limit the items per row", and their siblings.
 *
 * These boxes hang off the truth of their own value, and for a single element that is right: a
 * number means the limit is on, `null` means there is none. With more than one element selected the
 * merge writes `null` for "they disagree" as well, and the box then said "none of them has a limit"
 * about elements that all have one (#1167). The panel therefore also carries where the selection
 * diverges, and this pipe turns the two sources into the three states an
 * {@link MergedCheckboxComponent} can show:
 *
 * - `true` - all selected elements have the limit
 * - `false` - none of them has it
 * - `null` - they disagree, rendered as indeterminate
 *
 * Pure, and safe as such: `divergingProperties` is a fresh set on every merge, so a selection change
 * always reaches the pipe as a changed reference.
 */
@Pipe({
  name: 'limitEnabledState',
  standalone: false
})
export class LimitEnabledStatePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(divergingProperties: ReadonlySet<string> | undefined,
            path: string,
            value: number | null | undefined): boolean | null {
    if (divergingProperties?.has(path)) return null;
    return value !== null && value !== undefined;
  }
}
