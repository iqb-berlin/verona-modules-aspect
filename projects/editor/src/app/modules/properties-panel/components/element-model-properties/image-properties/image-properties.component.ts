import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { ImageProperties } from 'common/models/elements/interactive-group-elements/image';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-image-properties',
  templateUrl: './image-properties.component.html',
  styleUrls: ['./image-properties.component.scss'],
  standalone: false
})
export class ImagePropertiesComponent {
  @Input() combinedProperties!: Merged<ImageProperties>;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof ImageProperties;
      value: string | number | boolean | null,
      isInputValid?: boolean | null
    }>();

  /**
   * A number field has been left. The emit on `ngModelChange` handles neither case: an empty box
   * means zero, because these properties are declared `number` (#1154), and an invalid value was
   * refused by the guard in the host, so the box has to go back to what the model holds.
   *
   * Nothing is emitted while typing, because a box the browser cannot parse yet reads as empty too
   * and writing then stamps the value back over what is being typed.
   */
  commitNumber(control: NgModel, property: keyof ImageProperties, modelValue: number | null | undefined): void {
    if (control.invalid) {
      /* `emitViewToModelChange: false`, or putting the box back would itself look like the user
         typing and emit the rejected value straight out again. */
      control.control.setValue(modelValue, { emitViewToModelChange: false, emitEvent: false });
      return;
    }
    if (control.value === null) this.updateModel.emit({ property, value: 0, isInputValid: true });
  }
}
