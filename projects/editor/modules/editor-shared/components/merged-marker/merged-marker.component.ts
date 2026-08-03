import { Component } from '@angular/core';

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
 * Information rather than an action, so it is not focusable. The tooltip is duplicated as an
 * `aria-label`, and the icon has to opt out of the `aria-hidden` MatIcon gives itself, or that
 * label reaches nobody at all.
 *
 * How far that gets is worth being precise about: the label makes the marker readable in a screen
 * reader's browse mode, but it is **not** part of the field's accessible description. Material puts
 * only `mat-hint` and `mat-error` into an input's `aria-describedby`, so tabbing to the field
 * announces the label and not this. A checkbox has it better - its `indeterminate` is a native
 * `aria-checked="mixed"` on the control itself. Closing that gap needs a hint rather than a suffix,
 * which costs a line of height at every affected field; that was weighed and declined for the
 * visual design (#1138).
 *
 * The call site decides when to show it, rather than the component taking the value and hiding
 * itself. `matSuffix` is read from the element, not from what it renders: a marker that renders
 * nothing still counts as an icon suffix, and Material then drops the field's right inset from
 * 16px to 0 - on every such field, in the ordinary single-selection case (measured). Written as a condition
 * around the element, the field is untouched until there is something to say.
 *
 * ```html
 * <mat-form-field>
 *   <mat-label>…</mat-label>
 *   <input matInput …>
 *   @if (styles.fontSize === null) {
 *     <aspect-merged-marker matSuffix></aspect-merged-marker>
 *   }
 * </mat-form-field>
 * ```
 */
@Component({
  selector: 'aspect-merged-marker',
  templateUrl: './merged-marker.component.html',
  styleUrls: ['./merged-marker.component.scss'],
  standalone: false
})
export class MergedMarkerComponent {}
