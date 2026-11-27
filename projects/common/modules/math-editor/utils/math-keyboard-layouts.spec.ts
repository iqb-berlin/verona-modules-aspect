import {
  ENTER_KEY, FORMULA_KEYBOARD_PRESETS
} from 'common/modules/math-editor/configs/formula-keyboard-presets.config';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';
import { MathKeyboardLayouts } from './math-keyboard-layouts';

describe('MathKeyboardLayouts', () => {
  const {
    iqbPhysics, iqbNumeric, iqbSymbols, iqbText, iqbGreek
  } = FORMULA_KEYBOARD_PRESETS;

  it('should give every selected preset its layout, in the order of the tabs', () => {
    expect(MathKeyboardLayouts.select(['greek', 'latin', 'symbols', 'math', 'physics'], false))
      .toEqual([iqbPhysics, iqbNumeric, iqbSymbols, iqbText, iqbGreek]);
  });

  it('should leave out what is not selected', () => {
    expect(MathKeyboardLayouts.select(['math', 'greek'], false)).toEqual([iqbNumeric, iqbGreek]);
  });

  describe('in a multi-line field (#1696)', () => {
    const keysOf = (layout: unknown) => (layout as { layers: { rows: unknown[][] }[] }).layers[0].rows.flat();

    const rowsOf = (layout: unknown): unknown[][] => (layout as { layers: { rows: unknown[][] }[] }).layers[0].rows;

    it('should give the Latin letters the Enter key, and only them', () => {
      const [numeric, text, greek] = MathKeyboardLayouts.select(['math', 'latin', 'greek'], true);
      expect(keysOf(text)).toContain(ENTER_KEY);
      expect([numeric, greek]).toEqual([iqbNumeric, iqbGreek]);
    });

    it('should put the Enter key at the end of the bottom row of the letters, and change nothing else', () => {
      const letters = rowsOf(iqbText);
      expect(rowsOf(MathKeyboardLayouts.select(['latin'], true)[0]))
        .toEqual([...letters.slice(0, -1), [...letters[letters.length - 1], ENTER_KEY]]);
    });

    // In key widths, as MathLive lays them out; the letters have no key written as a string.
    it('should fill the bottom row of the letters to ten keys, like the rows above it', () => {
      const widths = rowsOf(MathKeyboardLayouts.select(['latin'], true)[0])
        .map(row => row.reduce((width: number, key) => width + ((key as { width?: number }).width ?? 1), 0));
      expect(widths).toEqual([10, 10, 10, 10]);
    });

    it('should leave the Latin letters of a single-line field without it', () => {
      expect(MathKeyboardLayouts.select(['latin'], false)[0]).toBe(iqbText);
      expect(keysOf(iqbText)).not.toContain(ENTER_KEY);
    });

    // The math input assigns layouts only when they are not the keyboard's already (#1600).
    it('should hand out the same layouts on every call', () => {
      const presets: MathKeyboardPreset[] = ['math', 'latin'];
      const first = MathKeyboardLayouts.select(presets, true);
      MathKeyboardLayouts.select(presets, true).forEach((layout, index) => expect(layout).toBe(first[index]));
    });
  });

  describe('the tab the keyboard opens on in a field whose input mode can be switched (#1692)', () => {
    it('should be the Latin letters in text mode', () => {
      expect(MathKeyboardLayouts.openingIndex(['math', 'symbols', 'latin', 'greek'], 'text')).toBe(2);
    });

    // The Greek keys insert formulas, so the Greek letters are a preset of formulas.
    it('should be the first tab in text mode when the Latin letters are not selected', () => {
      expect(MathKeyboardLayouts.openingIndex(['math', 'greek'], 'text')).toBe(0);
    });

    it('should be the first preset of formulas in formula mode', () => {
      expect(MathKeyboardLayouts.openingIndex(['math', 'latin', 'greek'], 'math')).toBe(0);
      expect(MathKeyboardLayouts.openingIndex(['latin', 'greek'], 'math')).toBe(1);
    });

    it('should be the first tab in formula mode when no preset of formulas is selected', () => {
      expect(MathKeyboardLayouts.openingIndex(['latin'], 'math')).toBe(0);
    });
  });
});
