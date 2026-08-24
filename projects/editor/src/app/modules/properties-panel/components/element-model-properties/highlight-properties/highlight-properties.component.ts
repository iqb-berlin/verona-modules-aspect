import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { HighlightableProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-highlight-properties',
  standalone: false,
  templateUrl: './highlight-properties.component.html'
})

export class HighlightPropertiesComponent {
  @Input() combinedProperties!: Merged<HighlightableProperties>;
  @Input() disabled!: boolean;
  @Output() updateModel =
    new EventEmitter<{ property: keyof HighlightableProperties; value: boolean }>();
}
