import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { DropdownProperties } from 'common/models/elements/input-group-elements/dropdown';
import { LikertProperties } from 'common/models/elements/compound-group-elements/likert/likert';
import { MathFieldProperties } from 'common/models/elements/text-input-group-elements/math-field';
import { InputElementProperties, MathKeyboardProperties } from 'common/models/input-element-interfaces';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

/**
 * The preset value of an input element, in the shape the element type calls for: a textarea, a
 * text field, a select over the options or the formula editor.
 *
 * Only `value` is written; the rest is read to pick that shape. `rows` is read solely to exclude
 * the likert, which has options but no single preset.
 */
export type PanelPresetValueProperties =
  Pick<UIElementProperties, 'type'> &
  Pick<InputElementProperties, 'value'> &
  Pick<DropdownProperties, 'options'> &
  Pick<LikertProperties, 'rows'> &
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
