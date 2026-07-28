import {
  Component, EventEmitter, Input, OnChanges, Output
} from '@angular/core';

/**
 * Checkbox for a property of the current selection, aware of the three states such a property can
 * have.
 *
 * With more than one element selected, `createCombinedProperties()` sets a property to `null` when
 * the elements disagree. Bound to a plain `mat-checkbox` that `null` arrives as falsy, so "on for
 * one, off for the other" looks exactly like "off for all" — and switching the box off then
 * overwrites the value the author could not see. This component renders that case as
 * `indeterminate` instead.
 *
 * Clicking an indeterminate box emits `true`, which is what a plain checkbox did before as well:
 * only the display changes, not what a click does.
 */
@Component({
  selector: 'aspect-merged-checkbox',
  templateUrl: './merged-checkbox.component.html',
  styleUrls: ['./merged-checkbox.component.scss'],
  standalone: false
})
export class MergedCheckboxComponent implements OnChanges {
  /** `null`: the selected elements disagree. `undefined`: the property is not set at all. */
  @Input() value: boolean | null | undefined;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  /**
   * The live state of the box, kept as fields rather than derived in the template so that call
   * sites reading it through a template reference — `#fixedWidth` and friends — see the same thing
   * a `mat-checkbox` gave them: the current UI state, updated on click before the model has come
   * back around.
   */
  checked: boolean = false;
  indeterminate: boolean = false;

  ngOnChanges(): void {
    this.checked = this.value ?? false;
    this.indeterminate = this.value === null;
  }

  toggle(checked: boolean): void {
    this.checked = checked;
    this.indeterminate = false;
    this.valueChange.emit(checked);
  }
}
