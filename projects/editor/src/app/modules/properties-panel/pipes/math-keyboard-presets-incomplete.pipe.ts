import { Pipe, PipeTransform } from '@angular/core';
import { MathKeyboardPreset, TEXT_MATH_KEYBOARD_PRESETS } from 'common/models/input-element-interfaces';

/**
 * Whether the formula keyboard of a math field whose input mode can be switched lacks a preset of text or
 * one of formulas (#1692). The keyboard opens each mode on a preset of its own, so the editor warns; it
 * does not stop the author.
 *
 * A selection that disagrees on the presets or on the switch (`null`) gets no warning, and neither does a
 * field without the switch (`undefined`, as the math text area has none).
 */
@Pipe({
  name: 'mathKeyboardPresetsIncomplete',
  standalone: false
})
export class MathKeyboardPresetsIncompletePipe implements PipeTransform {
  transform(presets: MathKeyboardPreset[] | null | undefined, enableModeSwitch: boolean | null | undefined): boolean {
    if (enableModeSwitch !== true || !presets) return false;
    const hasText = presets.some(preset => TEXT_MATH_KEYBOARD_PRESETS.includes(preset));
    const hasFormulas = presets.some(preset => !TEXT_MATH_KEYBOARD_PRESETS.includes(preset));
    return !hasText || !hasFormulas;
  }
}
