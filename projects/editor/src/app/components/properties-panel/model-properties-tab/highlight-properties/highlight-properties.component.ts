import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextProperties } from 'common/models/elements/text-group-elements/text';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-highlight-properties',
  standalone: false,
  templateUrl: './highlight-properties.component.html'
})

export class HighlightPropertiesComponent {
  @Input() combinedProperties!: Merged<TextProperties>;
  @Input() disabled!: boolean;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[];
      isInputValid?: boolean | null
    }>();
}
