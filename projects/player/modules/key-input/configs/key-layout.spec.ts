import { KeyLayout } from './key-layout';

describe('KeyLayout', () => {
  describe('getAllowedKeys', () => {
    it('should return the single character keys of a preset', () => {
      expect(KeyLayout.getAllowedKeys('comma')).toEqual([',']);
    });

    /* 'Backspace' and 'Shift' are commands of the keypad, not characters a key press may produce. */
    it('should leave out multi character keys', () => {
      expect(KeyLayout.getAllowedKeys('numbers'))
        .toEqual(['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']);
    });

    it('should include the additional rows', () => {
      expect(KeyLayout.getAllowedKeys('numbersAndOperators'))
        .toEqual(['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '+', '-', '·', ':', '=']);
    });

    /* The shift rows are deliberately not included: the restriction has always been keyed on the
       unshifted layout, so 'Â' stays blocked although the keypad offers it via Shift. */
    it('should not include the shift rows', () => {
      expect(KeyLayout.getAllowedKeys('french')).not.toContain('Â');
    });

    it('should use the custom keys of the custom preset', () => {
      expect(KeyLayout.getAllowedKeys('custom', 'xyz')).toEqual(['x', 'y', 'z']);
    });

    it('should add the line break for a field with a return key', () => {
      expect(KeyLayout.getAllowedKeys('comma', '', false, true)).toEqual([',', '\n']);
    });

    it('should not add the line break without a return key', () => {
      expect(KeyLayout.getAllowedKeys('comma', '', false, false)).not.toContain('\n');
    });
  });
});
