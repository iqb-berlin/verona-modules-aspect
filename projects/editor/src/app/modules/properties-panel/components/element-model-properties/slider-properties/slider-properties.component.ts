import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgModel } from '@angular/forms';
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
  @Output() updateModel =
    new EventEmitter<{
      property: keyof SliderProperties;
      value: string | number | boolean | string[],
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService) { }

  /**
   * A number field has been left. The emit on `ngModelChange` handles neither case: an empty box
   * means zero, because these properties are declared `number` (#1154), and an invalid value was
   * refused by the guard in the host, so the box has to go back to what the model holds.
   *
   * Nothing is emitted while typing, because a box the browser cannot parse yet reads as empty too
   * and writing then stamps the value back over what is being typed.
   */
  commitNumber(control: NgModel, property: keyof SliderProperties, modelValue: number | null | undefined): void {
    if (control.invalid) {
      /* `emitViewToModelChange: false`, or putting the box back would itself look like the user
         typing and emit the rejected value straight out again. */
      control.control.setValue(modelValue, { emitViewToModelChange: false, emitEvent: false });
      return;
    }
    if (control.value === null) this.updateModel.emit({ property, value: 0, isInputValid: true });
  }
}
