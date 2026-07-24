import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-highlight-properties',
  standalone: false,
  templateUrl: './highlight-properties.component.html'
})

export class HighlightPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() disabled!: boolean;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[];
      isInputValid?: boolean | null
    }>();
}
