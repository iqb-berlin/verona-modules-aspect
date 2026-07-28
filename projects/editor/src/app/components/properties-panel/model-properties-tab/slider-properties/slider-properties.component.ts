import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { SliderProperties } from 'common/models/elements/input-group-elements/slider';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-slider-properties',
  standalone: false,
  templateUrl: './slider-properties.component.html'
})
export class SliderPropertiesComponent {
  @Input() combinedProperties!: Merged<SliderProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();

  constructor(public unitService: UnitService) { }
}
