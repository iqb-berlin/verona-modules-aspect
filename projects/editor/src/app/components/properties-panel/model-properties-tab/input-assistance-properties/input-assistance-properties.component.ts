import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { INPUT_ASSISTANCE_CUSTOM_STYLES } from 'common/models/input-element-interfaces';

@Component({
  selector: 'aspect-input-assistance-properties',
  templateUrl: './input-assistance-properties.component.html',
  standalone: false
})

export class InputAssistancePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string;
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
