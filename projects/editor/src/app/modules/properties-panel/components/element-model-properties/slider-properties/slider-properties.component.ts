import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { SliderProperties } from 'common/models/elements/input-group-elements/slider';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-slider-properties',
  standalone: false,
  templateUrl: './slider-properties.component.html',
  styleUrls: ['./slider-properties.component.scss']
})
export class SliderPropertiesComponent {
  @Input() combinedProperties!: Merged<SliderProperties>;
  /**
   * `null` belongs in the value type: the preset is `InputElementValue`, where an empty box means
   * "no preset" and has to reach the model as null. Until the number boxes went through
   * `aspectNumberField` nothing said so - the emit came from `ngModelChange`, typed loosely enough
   * that the compiler never asked.
   */
  @Output() updateModel =
    new EventEmitter<{
      property: keyof SliderProperties;
      value: string | number | boolean | string[] | null,
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService) { }
}
