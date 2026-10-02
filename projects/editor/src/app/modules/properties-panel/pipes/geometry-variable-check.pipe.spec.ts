import { GeometryVariable } from 'common/models/geometry-interfaces';
import {
  GeometryVariableCheckPipe
} from 'editor/src/app/modules/properties-panel/pipes/geometry-variable-check.pipe';

describe('GeometryVariableCheckPipe', () => {
  const pipe = new GeometryVariableCheckPipe();
  const variables = (...names: string[]): GeometryVariable[] => names.map(id => ({ id, value: '' }));

  it('should pass a valid name', () => {
    expect(pipe.transform('A', variables('B'), variables('c'))).toEqual({ issue: null, isLocked: false });
  });

  it('should lock a name with characters the contract forbids while it is not chosen', () => {
    ['fistgewählt', 'α', "f'"].forEach(name => {
      expect(pipe.transform(name, [], [])).toEqual({ issue: 'INVALID_CHARACTERS', isLocked: true });
    });
  });

  /* Locked, it could no longer be taken out of the list -- in a unit stored before #1129 that is the only fix. */
  it('should keep a chosen name with an issue selectable', () => {
    expect(pipe.transform('fistgewählt', variables('fistgewählt'), []))
      .toEqual({ issue: 'INVALID_CHARACTERS', isLocked: false });
  });

  it('should lock a name that differs from a chosen one only in letter case, in either list', () => {
    expect(pipe.transform('a', variables('A'), [])).toEqual({ issue: 'DUPLICATE_ALIAS', isLocked: true });
    expect(pipe.transform('a', [], variables('A'))).toEqual({ issue: 'DUPLICATE_ALIAS', isLocked: true });
  });

  it('should not count the same name chosen in both lists as a duplicate', () => {
    expect(pipe.transform('A', variables('A'), variables('A'))).toEqual({ issue: null, isLocked: false });
  });

  it('should cope with lists the merged view does not have', () => {
    expect(pipe.transform('A', null, null)).toEqual({ issue: null, isLocked: false });
  });
});
