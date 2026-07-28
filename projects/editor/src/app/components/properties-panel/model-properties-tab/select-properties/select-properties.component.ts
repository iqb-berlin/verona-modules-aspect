import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  RadioButtonGroupComplexProperties
} from 'common/models/elements/input-group-elements/radio-button-group-complex';
import { RadioButtonGroupProperties } from 'common/models/elements/input-group-elements/radio-button-group';
import { DropdownProperties } from 'common/models/elements/input-group-elements/dropdown';
import { ToggleButtonProperties } from 'common/models/elements/compound-group-elements/toggle-button';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * The panel's view of the options-style elements.
 *
 * This component corresponds to no single model level: its four properties come from four
 * interfaces and are offered for four element types — `strikeOtherOptions` for the radio group and
 * the toggle button, `strikeSelectedOption` for the toggle button, `allowUnset` for the dropdown
 * and `itemsPerRow` for the image radio group. Composing them with `Pick` records which property
 * belongs to which element type, instead of inventing one interface spanning all four.
 *
 * `strikeOtherOptions` is declared separately and identically by `RadioButtonGroupProperties` and
 * `ToggleButtonProperties` — another instance of the missing shared level that #1141 collected,
 * found too late to be in that survey. It is picked from the radio group here, so the two
 * declarations must not drift apart.
 */
export type PanelSelectProperties =
  Pick<RadioButtonGroupProperties, 'strikeOtherOptions'> &
  Pick<ToggleButtonProperties, 'strikeSelectedOption'> &
  Pick<DropdownProperties, 'allowUnset'> &
  Pick<RadioButtonGroupComplexProperties, 'itemsPerRow'>;

@Component({
  selector: 'aspect-select-properties',
  templateUrl: './select-properties.component.html',
  standalone: false
})
export class SelectPropertiesComponent {
  /**
   * On `itemsPerRow`: the model already uses `null` for "no limit", while `Merged<T>` uses `null`
   * for "the selected elements disagree". Both arrive as the same value here, which is why the
   * limit checkbox stays a plain `mat-checkbox` instead of an `aspect-merged-checkbox`.
   */
  @Input() combinedProperties!: Merged<PanelSelectProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PanelSelectProperties,
      value: string | number | boolean | string[] | null
    }>();

  constructor(public unitService: UnitService) { }

  setItemsPerRow(isLimited: boolean) {
    if (!isLimited) {
      this.updateModel.emit({ property: 'itemsPerRow', value: null });
    } else {
      this.updateModel.emit({ property: 'itemsPerRow', value: 4 });
    }
  }
}
