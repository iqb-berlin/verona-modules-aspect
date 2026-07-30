import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  MATH_KEYBOARD_PRESETS, MathKeyboardPreset, MathKeyboardProperties
} from 'common/models/input-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * Which presets the formula keyboard offers, for the math field and the math text area.
 *
 * Corresponds exactly to `MathKeyboardProperties`, so the property name is checked on both the
 * read and the write side.
 */
@Component({
  selector: 'aspect-math-keyboard-properties',
  templateUrl: './math-keyboard-properties.component.html',
  standalone: false
})
export class MathKeyboardPropertiesComponent {
  @Input() combinedProperties!: Merged<MathKeyboardProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof MathKeyboardProperties; value: MathKeyboardPreset[] }>();

  MATH_KEYBOARD_PRESETS = MATH_KEYBOARD_PRESETS;

  constructor(public unitService: UnitService) { }
}
