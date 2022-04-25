import { ElementFactory } from 'common/util/element.factory';

describe('ElementFactory', () => {
  const factory = ElementFactory;

  it('should return frame element with styles', () => {
    const createdElement = factory.createElement({
      type: 'frame',
      styling: {
        borderWidth: 3,
        borderColor: 'red',
        borderStyle: 'inset'
      }
    });
    expect(Object.keys(createdElement))
      .toContain('styling');
    expect(createdElement.styling)
      .toEqual(jasmine.objectContaining({
        borderRadius: 0,
        borderWidth: 3,
        borderColor: 'red',
        borderStyle: 'inset'
      }));
  });
});
