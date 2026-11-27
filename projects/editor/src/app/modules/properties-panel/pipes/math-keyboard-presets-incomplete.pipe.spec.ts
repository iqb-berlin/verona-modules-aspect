import { MathKeyboardPresetsIncompletePipe } from './math-keyboard-presets-incomplete.pipe';

describe('MathKeyboardPresetsIncompletePipe (#1692)', () => {
  const pipe = new MathKeyboardPresetsIncompletePipe();

  it('should warn when the Latin letters are missing while the mode can be switched', () => {
    expect(pipe.transform(['math', 'symbols', 'greek'], true)).toBe(true);
  });

  it('should warn when no preset of formulas is selected while the mode can be switched', () => {
    expect(pipe.transform(['latin'], true)).toBe(true);
  });

  // The Greek keys insert formulas, so the Greek letters count as a preset of formulas.
  it('should take the Greek letters as a preset of formulas', () => {
    expect(pipe.transform(['latin', 'greek'], true)).toBe(false);
  });

  it('should not warn when the mode cannot be switched', () => {
    expect(pipe.transform(['math'], false)).toBe(false);
    expect(pipe.transform(['math'], undefined)).toBe(false);
  });

  it('should not warn for a selection that disagrees', () => {
    expect(pipe.transform(['math'], null)).toBe(false);
    expect(pipe.transform(null, true)).toBe(false);
  });
});
