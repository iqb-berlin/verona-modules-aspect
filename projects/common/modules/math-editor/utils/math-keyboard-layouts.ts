import { VirtualKeyboardKeycap, VirtualKeyboardLayout } from 'mathlive';
import { MathKeyboardPreset, TEXT_MATH_KEYBOARD_PRESETS } from 'common/models/input-element-interfaces';
import {
  ENTER_KEY, FORMULA_KEYBOARD_PRESETS
} from 'common/modules/math-editor/configs/formula-keyboard-presets.config';

/** `multilineLayout` takes the place of `layout` in a multi-line field. */
type PresetLayout = {
  preset: MathKeyboardPreset;
  layout: VirtualKeyboardLayout;
  multilineLayout?: VirtualKeyboardLayout;
};

type KeyboardRows = (string | Partial<VirtualKeyboardKeycap>)[][];

/**
 * Which layouts the formula keyboard offers a field, and on which of them it opens.
 *
 * A field offers every selected preset, in the order of the tabs, whatever its input mode. In a field
 * whose mode can be switched, the mode decides the tab the keyboard opens on (#1692): formula mode the
 * first preset of formulas, text mode the first preset of text (`TEXT_MATH_KEYBOARD_PRESETS`). The other
 * tabs stay at hand, so that `2x+3` can take its x from the letters. Without a preset of the mode's group
 * the keyboard opens on its first tab.
 *
 * A multi-line field gets the Latin letters with the Enter key, which starts a new line in text mode
 * (#1696); a single-line field, the Formelbereich among them, gets them as they are.
 *
 * The layouts handed out are always the same objects -- those of `FORMULA_KEYBOARD_PRESETS`, and the
 * variant with the Enter key, made once here -- never fresh copies: the math input assigns them only when
 * they are not the keyboard's already (#1600).
 */
export class MathKeyboardLayouts {
  /** The presets in the order of their tabs, each with its layout. */
  private static readonly ORDER: PresetLayout[] = [
    { preset: 'physics', layout: FORMULA_KEYBOARD_PRESETS.iqbPhysics },
    { preset: 'math', layout: FORMULA_KEYBOARD_PRESETS.iqbNumeric },
    { preset: 'symbols', layout: FORMULA_KEYBOARD_PRESETS.iqbSymbols },
    {
      preset: 'latin',
      layout: FORMULA_KEYBOARD_PRESETS.iqbText,
      multilineLayout: MathKeyboardLayouts.withEnterKey(FORMULA_KEYBOARD_PRESETS.iqbText)
    },
    { preset: 'greek', layout: FORMULA_KEYBOARD_PRESETS.iqbGreek }
  ];

  /** The layouts of the selected presets, in the order of their tabs. */
  static select(presets: MathKeyboardPreset[], multiline: boolean): VirtualKeyboardLayout[] {
    return MathKeyboardLayouts.selected(presets)
      .map(entry => (multiline && entry.multilineLayout) || entry.layout);
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

  /** A copy of `layout` with `ENTER_KEY` at the end of the bottom row of each of its layers. */
  private static withEnterKey(layout: VirtualKeyboardLayout): VirtualKeyboardLayout {
    const withEnterKeyInRows = (rows: KeyboardRows): KeyboardRows => [
      ...rows.slice(0, -1),
      [...rows[rows.length - 1], ENTER_KEY]
    ];
    if ('rows' in layout) return { ...layout, rows: withEnterKeyInRows(layout.rows) };
    if (!('layers' in layout)) return layout;
    return {
      ...layout,
      layers: layout.layers.map(layer => (typeof layer === 'string' || !layer.rows ?
        layer :
        { ...layer, rows: withEnterKeyInRows(layer.rows) }))
    };
  }
}
