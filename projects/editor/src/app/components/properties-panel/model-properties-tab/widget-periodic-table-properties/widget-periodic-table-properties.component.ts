import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { WidgetPeriodicTableProperties } from 'common/models/elements/widget-group-elements/widget-periodic-table';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-widget-periodic-table-properties',
  standalone: false,
  templateUrl: './widget-periodic-table-properties.component.html'
})
export class WidgetPeriodicTablePropertiesComponent {
  @Input() combinedProperties!: Merged<WidgetPeriodicTableProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}
