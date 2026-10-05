import { VariableAlias } from 'common/utils/variable-alias';

describe('VariableAlias', () => {
  it('should accept names with letters, digits, underscore and dash', () => {
    expect(VariableAlias.isValid('var1')).toBe(true);
    expect(VariableAlias.isValid('drop-list_2')).toBe(true);
    expect(VariableAlias.isValid('ABC-def_123')).toBe(true);
    expect(VariableAlias.isValid('_')).toBe(true);
    expect(VariableAlias.isValid('-')).toBe(true);
  });

  it('should reject names with umlauts or other special characters', () => {
    expect(VariableAlias.isValid('März')).toBe(false);
    expect(VariableAlias.isValid('Häufigkeiten')).toBe(false);
    expect(VariableAlias.isValid('Lösung1')).toBe(false);
    expect(VariableAlias.isValid('a.b')).toBe(false);
    expect(VariableAlias.isValid('a+b')).toBe(false);
  });

  it('should reject names with leading or trailing whitespace', () => {
    expect(VariableAlias.isValid('weiter ')).toBe(false);
    expect(VariableAlias.isValid(' weiter')).toBe(false);
    expect(VariableAlias.isValid('wei ter')).toBe(false);
  });

  it('should reject empty names', () => {
    expect(VariableAlias.isValid('')).toBe(false);
  });

  it('should accept one-character names and names longer than 20 characters', () => {
    ['a', 'b', 'c', 'a_very_long_variable_name_beyond_twenty'].forEach(name => {
      expect(VariableAlias.check(name)).toBeNull();
    });
  });

  it('should name the issue the contract names', () => {
    expect(VariableAlias.check('')).toBe('EMPTY_IDENTIFIER');
    expect(VariableAlias.check('a.b')).toBe('INVALID_CHARACTERS');
    expect(VariableAlias.check('a b')).toBe('INVALID_CHARACTERS');
    expect(VariableAlias.check('fistgewählt')).toBe('INVALID_CHARACTERS');
  });

  /* One rule for the models that refuse a name and for the fields that say why (#1523). */
  it('should tell why a typed name cannot be taken, a taken one first and a space before other characters', () => {
    expect(VariableAlias.problemOf('frei_1', true)).toBeNull();
    expect(VariableAlias.problemOf('März ', false)).toBe('taken');
    expect(VariableAlias.problemOf('März ', true)).toBe('space');
    expect(VariableAlias.problemOf('März', true)).toBe('invalidCharacters');
    expect(VariableAlias.problemOf('', true)).toBe('invalidCharacters');
  });

  it('should give names that differ only in letter case the same comparable form', () => {
    expect(VariableAlias.toComparable('Wert')).toBe(VariableAlias.toComparable('wert'));
    expect(VariableAlias.toComparable('Wert')).not.toBe(VariableAlias.toComparable('Werte'));
  });

  /* HTML compiles a `pattern` attribute with the `v` flag. A pattern that does not survive that is
     silently discarded by the browser, and the field it belongs to is no longer checked natively at
     all -- which is what happened while the hyphen stood bare (#1391). */
  it('should be a pattern an HTML pattern attribute can use', () => {
    expect(() => new RegExp(VariableAlias.PATTERN_SOURCE, 'v')).not.toThrow();
  });

  it('should mean the same under the v flag as it does in code', () => {
    const asHtmlWould = new RegExp(`^${VariableAlias.PATTERN_SOURCE}$`, 'v');
    ['var1', 'drop-list_2', '-', 'März', 'a b', ''].forEach(name => {
      expect(asHtmlWould.test(name)).toBe(VariableAlias.isValid(name));
    });
  });
});
