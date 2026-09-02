import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { INPUT_ASSISTANCE_CUSTOM_STYLES, TextInputElementProperties } from 'common/models/input-element-interfaces';
import { MathTableProperties } from 'common/models/elements/math-table';
import { TextAreaProperties } from 'common/models/elements/text-area';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

/**
 * What this component reads. It is offered for text inputs and for the math table, and those do not
 * share a common level in the element model — the math table implements KeyInputElementProperties
 * without being a TextInputElement. Composed from existing interfaces rather than a new one, so no
 * field name is invented here; #1141 is about giving the model the levels that would make this
 * composition unnecessary.
 */
type InputAssistanceHost = TextInputElementProperties &
Pick<MathTableProperties, 'operation'> &
Pick<TextAreaProperties, 'hasReturnKey'>;

@Component({
  selector: 'aspect-input-assistance-properties',
  templateUrl: './input-assistance-properties.component.html',
  standalone: false
})

export class InputAssistancePropertiesComponent {
  @Input() combinedProperties!: Merged<InputAssistanceHost>;
  @Output() updateModel = new EventEmitter<{
    property: keyof InputAssistanceHost;
    value: string | number | boolean | string[] | null;
    isInputValid?: boolean | null;
  }>();

  INPUT_ASSISTANCE_CUSTOM_STYLES = INPUT_ASSISTANCE_CUSTOM_STYLES;

  updateInputAssistancePreset(inputAssistancePreset: string | null): void {
    this.updateModel.emit({ property: 'inputAssistancePreset', value: inputAssistancePreset });
    if (!inputAssistancePreset && !this.combinedProperties.showSoftwareKeyboard) {
      this.updateModel.emit({ property: 'hideNativeKeyboard', value: false });
    }
  }

  updateShowSoftwareKeyboard(showSoftwareKeyboard: boolean): void {
    this.updateModel.emit({ property: 'showSoftwareKeyboard', value: showSoftwareKeyboard });
    if (showSoftwareKeyboard) {
      this.updateModel.emit({ property: 'hideNativeKeyboard', value: true });
    } else if (!this.combinedProperties.inputAssistancePreset) {
      this.updateModel.emit({ property: 'hideNativeKeyboard', value: false });
    }
  }
}
