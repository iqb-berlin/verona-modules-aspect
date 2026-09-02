import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MarkingPanelProperties } from 'common/models/elements/marking-panel';
import { HighlightableProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-marking-panel-properties',
  standalone: false,
  templateUrl: './marking-panel-properties.component.html'
})
export class MarkingPanelPropertiesComponent {
  @Input() combinedProperties!: Merged<MarkingPanelProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof HighlightableProperties; value: boolean }>();
}
