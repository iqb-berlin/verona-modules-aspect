import { GeometryElement } from 'common/models/elements/geometry';

describe('GeometryElement', () => {
  it.each([true, false])('should keep a stored showAlgebraInput %s', showAlgebraInput => {
    const element = new GeometryElement({
      id: 'geometry_1',
      type: 'geometry',
      appDefinition: 'base64',
      trackedVariables: [],
      trackedExpectedVariables: [],
      showAlgebraInput
    });

    expect(element.showAlgebraInput).toBe(showAlgebraInput);
  });
});
