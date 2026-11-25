import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  MATH_KEYBOARD_PRESETS, MathKeyboardPreset, MathKeyboardProperties
} from 'common/models/input-element-interfaces';
import { MathFieldProperties } from 'common/models/elements/math-field';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * Which presets the formula keyboard offers, for the math field and the math text area.
 *
 * Writes exactly `MathKeyboardProperties`, so the property name is checked on both the read and the
 * write side. It also reads the math field's `enableModeSwitch`, to warn when a mode that can be switched
 * lacks a preset of text or of formulas (#1692). The math text area has no such property and no warning.
 */
@Component({
  selector: 'aspect-math-keyboard-properties',
  templateUrl: './math-keyboard-properties.component.html',
  styleUrls: ['./math-keyboard-properties.component.scss'],
  standalone: false
})
export class MathKeyboardPropertiesComponent {
  @Input() combinedProperties!: Merged<MathKeyboardProperties & Partial<Pick<MathFieldProperties, 'enableModeSwitch'>>>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof MathKeyboardProperties; value: MathKeyboardPreset[] }>();

  MATH_KEYBOARD_PRESETS = MATH_KEYBOARD_PRESETS;

  constructor(public unitService: UnitService) { }
}
