import { GeometryVariable } from 'common/models/geometry-interfaces';
import { GeometryVariableNames } from 'editor/src/app/utils/geometry-variable-names';

describe('GeometryVariableNames', () => {
  const variables = (...names: string[]): GeometryVariable[] => names.map(id => ({ id, value: '' }));

  it('should pass names the contract allows', () => {
    expect(GeometryVariableNames.findIssue('A', variables('B'))).toBeNull();
    expect(GeometryVariableNames.findIssue('punkt-1', [])).toBeNull();
  });

  it('should object to the characters GeoGebra allows and the contract does not', () => {
    ['fistgewählt', 'α', "f'", 'A 1'].forEach(name => {
      expect(GeometryVariableNames.findIssue(name, [])).toBe('INVALID_CHARACTERS');
    });
  });

  it('should object to a name that differs from a chosen one only in letter case', () => {
    expect(GeometryVariableNames.findIssue('a', variables('A'))).toBe('DUPLICATE_ALIAS');
  });

  it('should not count the name itself as its duplicate', () => {
    expect(GeometryVariableNames.findIssue('A', variables('A'))).toBeNull();
  });
});
