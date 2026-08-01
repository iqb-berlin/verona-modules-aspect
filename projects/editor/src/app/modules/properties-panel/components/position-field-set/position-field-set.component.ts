import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-position-field-set',
  templateUrl: './position-field-set.component.html',
  styleUrls: ['./position-field-set.component.scss'],
  standalone: false
})
export class PositionFieldSetComponent {
  @Input() positionProperties!: Merged<PositionProperties>;
  @Input() isZIndexDisabled: boolean = false;
  @Output() updateModel =
    new EventEmitter<{
      property: keyof PositionProperties;
      value: UIElementValue,
      isInputValid?: boolean | null
    }>();

  constructor(public unitService: UnitService, public selectionService: SelectionService) {}

  /**
   * A number field has been left. Two things can be true then, and the emit on `ngModelChange`
   * handles neither:
   *
   * - the box is empty. These properties are declared `number`, so an empty box means zero (#1154).
   *   Nothing is emitted while typing, because a box the browser cannot parse yet - a lone `-`,
   *   say - also reads as empty, and writing then stamps the value back over what is being typed.
   * - the value is invalid, so the guard in the host refused it and the model still holds the old
   *   one. The box has to follow, or it keeps showing a number that was never saved.
   */
  commitNumber(control: NgModel,
               property: keyof PositionProperties,
               modelValue: UIElementValue): void {
    if (control.invalid) {
      /* `emitViewToModelChange: false`, or putting the box back would itself look like the user
         typing and emit the rejected value straight out again. */
      control.control.setValue(modelValue, { emitViewToModelChange: false, emitEvent: false });
      return;
    }
    if (control.value === null) this.updateModel.emit({ property, value: 0, isInputValid: true });
  }
}
