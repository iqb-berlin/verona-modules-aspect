import { GeometryVariable } from 'common/models/geometry-interfaces';
import {
  GeometryVariableOptionsPipe
} from 'editor/src/app/modules/properties-panel/pipes/geometry-variable-options.pipe';

describe('GeometryVariableOptionsPipe', () => {
  const pipe = new GeometryVariableOptionsPipe();
  const variables = (...names: string[]): GeometryVariable[] => names.map(id => ({ id, value: '' }));

  it('should offer the objects of the file', () => {
    expect(pipe.transform(variables('A', 'B'), variables('A')).map(option => option.variable.id)).toEqual(['A', 'B']);
    expect(pipe.transform(variables('A', 'B'), variables('A')).every(option => !option.isMissing)).toBe(true);
  });

  /* After the file was replaced they were not in the list at all, so they could not be taken out (#1505). */
  it('should add tracked variables the file no longer has, marked as missing', () => {
    const options = pipe.transform(variables('A', 'fistgewaehlt'), variables('A', 'fistgewählt'));

    expect(options.map(option => [option.variable.id, option.isMissing])).toEqual([
      ['A', false], ['fistgewaehlt', false], ['fistgewählt', true]
    ]);
  });

  it('should offer a missing name once even where the stored list holds it twice', () => {
    expect(pipe.transform(variables('A'), variables('alt', 'alt')).map(option => option.variable.id))
      .toEqual(['A', 'alt']);
  });

  it('should offer nothing and tell nothing missing before the applet has loaded', () => {
    expect(pipe.transform(null, variables('A'))).toEqual([]);
  });

  it('should cope with a selection whose tracked variables differ', () => {
    expect(pipe.transform(variables('A'), null).map(option => option.variable.id)).toEqual(['A']);
  });
});
