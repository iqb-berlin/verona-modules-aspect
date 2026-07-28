import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MarkingPanelProperties } from 'common/models/elements/interactive-group-elements/marking-panel';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-marking-panel-properties',
  standalone: false,
  templateUrl: './marking-panel-properties.component.html'
})
export class MarkingPanelPropertiesComponent {
  @Input() combinedProperties!: Merged<MarkingPanelProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[], isInputValid?: boolean | null;
    }>();
}
