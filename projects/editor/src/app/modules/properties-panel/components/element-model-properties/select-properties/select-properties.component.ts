import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  RadioButtonGroupComplexProperties
} from 'common/models/elements/input-group-elements/radio-button-group-complex';
import { DropdownProperties } from 'common/models/elements/input-group-elements/dropdown';
import {
  RadioButtonGroupProperties
} from 'common/models/elements/input-group-elements/radio-button-group';
import { ToggleButtonProperties } from 'common/models/elements/compound-group-elements/toggle-button';
import { StrikeOtherOptionsProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * The panel's view of the options-style elements.
 *
 * This component corresponds to no single model level: its four properties are offered for four
 * element types — `strikeOtherOptions` for the radio group and the toggle button,
 * `strikeSelectedOption` for the toggle button, `allowUnset` for the dropdown and `itemsPerRow` for
 * the image radio group. The three that belong to exactly one element type are composed with `Pick`,
 * which records that ownership instead of inventing one interface spanning all four.
 *
 * `strikeOtherOptions` used to be declared separately and identically by the radio group and the
 * toggle button, and was picked from the radio group here — which quietly made this component the
 * place where the two had to agree. It now has its own level, so the model states the sharing
 * itself.
 */
export type PanelSelectProperties =
  StrikeOtherOptionsProperties &
  Pick<RadioButtonGroupProperties, 'alignment'> &
  Pick<ToggleButtonProperties, 'strikeSelectedOption' | 'verticalOrientation'> &
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
      value: string | number | boolean | string[] | null,
      isInputValid?: boolean | null
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
