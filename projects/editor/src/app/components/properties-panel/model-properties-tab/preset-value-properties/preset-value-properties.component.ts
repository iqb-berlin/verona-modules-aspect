import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-preset-value-properties',
  templateUrl: './preset-value-properties.component.html',
  standalone: false
})
export class PresetValuePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  showLatexEditor = false;
}
