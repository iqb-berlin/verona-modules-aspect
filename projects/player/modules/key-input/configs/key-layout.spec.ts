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

    /* The keypad offers the uppercase characters of the french preset through its Shift key, so a
       restricted field has to accept and release them like the lowercase ones (#1291). */
    it('should include the shift rows', () => {
      expect(KeyLayout.getAllowedKeys('french')).toContain('Â');
    });

    it('should list a key that appears in several layers once', () => {
      const allowedKeys = KeyLayout.getAllowedKeys('french');

      expect(allowedKeys.filter(key => key === 'ò')).toEqual(['ò']);
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
