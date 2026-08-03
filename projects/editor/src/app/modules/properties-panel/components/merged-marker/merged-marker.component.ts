import { Component, Input } from '@angular/core';

/**
 * Marks a field whose selected elements disagree about the value.
 *
 * With more than one element selected, `createCombinedProperties()` sets a property to `null` when
 * the elements do not share a value. A checkbox shows that as `indeterminate` (see
 * `merged-checkbox`), but every other control renders `null` as nothing at all - an empty box, an
 * empty select - which reads exactly like "empty everywhere" (#1138).
 *
 * This is the counterpart for those controls: a dash at the edge of the field, the same glyph an
 * indeterminate checkbox uses, so the two say the same thing in the same way. Sits in the field's
 * suffix, which costs no vertical space - the panel is long enough already, and a hint line under
 * each of the roughly ninety affected fields would add a lot of it.
 *
 * Information rather than an action, so it is not focusable; the tooltip is duplicated as an
 * `aria-label` because a tooltip alone never reaches a screen reader.
 *
 * Placed at the call site with `matSuffix`:
 *
 * ```html
 * <mat-form-field>
 *   <mat-label>…</mat-label>
 *   <input matInput …>
 *   <aspect-merged-marker matSuffix [value]="styles.fontSize"></aspect-merged-marker>
 * </mat-form-field>
 * ```
 */
@Component({
  selector: 'aspect-merged-marker',
  templateUrl: './merged-marker.component.html',
  styleUrls: ['./merged-marker.component.scss'],
  standalone: false
})
export class MergedMarkerComponent {
  /**
   * The merged property this field shows. Only `null` is marked: it is what the merge produces for
   * "the selection disagrees". `undefined` means the property is not part of the selection at all,
   * and such a field is not rendered in the first place.
   */
  @Input() value: unknown;
}
