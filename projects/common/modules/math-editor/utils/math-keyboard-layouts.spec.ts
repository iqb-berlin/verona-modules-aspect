import { FORMULA_KEYBOARD_PRESETS } from 'common/modules/math-editor/configs/formula-keyboard-presets.config';
import { MathKeyboardLayouts } from './math-keyboard-layouts';

describe('MathKeyboardLayouts', () => {
  const {
    iqbPhysics, iqbNumeric, iqbSymbols, iqbText, iqbGreek
  } = FORMULA_KEYBOARD_PRESETS;

  it('should give every selected preset its layout, in the order of the tabs', () => {
    expect(MathKeyboardLayouts.select(['greek', 'latin', 'symbols', 'math', 'physics']))
      .toEqual([iqbPhysics, iqbNumeric, iqbSymbols, iqbText, iqbGreek]);
  });

  it('should leave out what is not selected', () => {
    expect(MathKeyboardLayouts.select(['math', 'greek'])).toEqual([iqbNumeric, iqbGreek]);
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
