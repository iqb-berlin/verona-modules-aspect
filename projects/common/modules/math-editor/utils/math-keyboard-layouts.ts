import { VirtualKeyboardLayout } from 'mathlive';
import { MathKeyboardPreset, TEXT_MATH_KEYBOARD_PRESETS } from 'common/models/input-element-interfaces';
import { FORMULA_KEYBOARD_PRESETS } from 'common/modules/math-editor/configs/formula-keyboard-presets.config';

type PresetLayout = { preset: MathKeyboardPreset; layout: VirtualKeyboardLayout };

/**
 * Which layouts the formula keyboard offers a field, and on which of them it opens.
 *
 * A field offers every selected preset, in the order of the tabs, whatever its input mode. In a field
 * whose mode can be switched, the mode decides the tab the keyboard opens on (#1692): formula mode the
 * first preset of formulas, text mode the first preset of text (`TEXT_MATH_KEYBOARD_PRESETS`). The other
 * tabs stay at hand, so that `2x+3` can take its x from the letters. Without a preset of the mode's group
 * the keyboard opens on its first tab.
 *
 * The layouts handed out are the constants of `FORMULA_KEYBOARD_PRESETS` themselves, never copies: the
 * math input assigns them only when they are not the keyboard's already (#1600).
 */
export class MathKeyboardLayouts {
  /** The presets in the order of their tabs, each with its layout. */
  private static readonly ORDER: PresetLayout[] = [
    { preset: 'physics', layout: FORMULA_KEYBOARD_PRESETS.iqbPhysics },
    { preset: 'math', layout: FORMULA_KEYBOARD_PRESETS.iqbNumeric },
    { preset: 'symbols', layout: FORMULA_KEYBOARD_PRESETS.iqbSymbols },
    { preset: 'latin', layout: FORMULA_KEYBOARD_PRESETS.iqbText },
    { preset: 'greek', layout: FORMULA_KEYBOARD_PRESETS.iqbGreek }
  ];

  /** The layouts of the selected presets, in the order of their tabs. */
  static select(presets: MathKeyboardPreset[]): VirtualKeyboardLayout[] {
    return MathKeyboardLayouts.selected(presets).map(entry => entry.layout);
  }

  /** The position, among the layouts of `select`, of the one the keyboard opens on in `mode`. */
  static openingIndex(presets: MathKeyboardPreset[], mode: 'math' | 'text'): number {
    const index = MathKeyboardLayouts.selected(presets)
      .findIndex(entry => TEXT_MATH_KEYBOARD_PRESETS.includes(entry.preset) === (mode === 'text'));
    return Math.max(index, 0);
  }

  private static selected(presets: MathKeyboardPreset[]): PresetLayout[] {
    return MathKeyboardLayouts.ORDER.filter(entry => presets.includes(entry.preset));
  }
}
