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
});
