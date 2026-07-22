import { VariableAlias } from 'common/utils/variable-alias';

describe('VariableAlias', () => {
  it('should accept names with letters, digits, underscore and dash', () => {
    expect(VariableAlias.isValid('var1')).toBeTrue();
    expect(VariableAlias.isValid('drop-list_2')).toBeTrue();
    expect(VariableAlias.isValid('ABC-def_123')).toBeTrue();
    expect(VariableAlias.isValid('_')).toBeTrue();
    expect(VariableAlias.isValid('-')).toBeTrue();
  });

  it('should reject names with umlauts or other special characters', () => {
    expect(VariableAlias.isValid('März')).toBeFalse();
    expect(VariableAlias.isValid('Häufigkeiten')).toBeFalse();
    expect(VariableAlias.isValid('Lösung1')).toBeFalse();
    expect(VariableAlias.isValid('a.b')).toBeFalse();
    expect(VariableAlias.isValid('a+b')).toBeFalse();
  });

  it('should reject names with leading or trailing whitespace', () => {
    expect(VariableAlias.isValid('weiter ')).toBeFalse();
    expect(VariableAlias.isValid(' weiter')).toBeFalse();
    expect(VariableAlias.isValid('wei ter')).toBeFalse();
  });

  it('should reject empty names', () => {
    expect(VariableAlias.isValid('')).toBeFalse();
  });
});
