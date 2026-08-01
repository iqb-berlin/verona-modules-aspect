import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { DropdownProperties } from 'common/models/elements/input-group-elements/dropdown';
import { MathFieldProperties } from 'common/models/elements/text-input-group-elements/math-field';
import { InputElementProperties, MathKeyboardProperties } from 'common/models/input-element-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * The preset value of an input element, in the shape the element type calls for: a textarea, a
 * text field, a select over the options or the formula editor.
 *
 * Only `value` is written; the rest is read to pick that shape.
 *
 * Which element types get here at all is `PANEL_SECTIONS`' business, not this component's. It used
 * to read `rows` as well, to keep the likert out - the likert has options but no single preset.
 * Since #1137 the likert simply has no `presetValue` section, and `panelSectionsOf()` intersects
 * for a multi-selection, so it cannot arrive here mixed with a dropdown either (#1158).
 */
export type PanelPresetValueProperties =
  Pick<UIElementProperties, 'type'> &
  Pick<InputElementProperties, 'value'> &
  Pick<DropdownProperties, 'options'> &
  Pick<MathFieldProperties, 'enableModeSwitch'> &
  Pick<MathKeyboardProperties, 'mathKeyboardPresets'>;

@Component({
  selector: 'aspect-preset-value-properties',
  templateUrl: './preset-value-properties.component.html',
  standalone: false
})
export class PresetValuePropertiesComponent {
  @Input() combinedProperties!: Merged<PanelPresetValueProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PanelPresetValueProperties;
      value: string | number | boolean | string[],
      isInputValid?: boolean | null
    }>();

  showLatexEditor = false;
}
