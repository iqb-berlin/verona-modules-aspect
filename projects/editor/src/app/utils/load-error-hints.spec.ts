import { AbstractIDService } from 'common/models/id-interfaces';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { LoadErrorHints } from 'editor/src/app/utils/load-error-hints';

describe('LoadErrorHints', () => {
  const idService = {
    getAndRegisterNewID: (idType: string): string => `${idType}_generated`,
    register: (): void => {},
    unregister: (): void => {},
    isAliasAvailable: (): boolean => true,
    changeAlias: (): void => {}
  } as unknown as AbstractIDService;

  const create = (properties: Record<string, unknown>): PositionedUIElement => ElementFactory
    .createElement(properties as unknown as UIElementProperties, idService) as PositionedUIElement;

  let unit: EditorUnit;
  let image: PositionedUIElement;

  beforeEach(() => {
    unit = new EditorUnit(undefined, idService);
    unit.pages.push(new EditorPage(undefined, idService));
    image = create({ type: 'image', id: 'image_1', alias: 'bild' });
    unit.pages[1].sections[0].elements.push(image);
  });

  it('should name the element of an error and where it sits', () => {
    const error = { code: 'image-not-loading', message: 'Failed', elementId: 'image_1' };

    expect(LoadErrorHints.resolve(unit, [error])).toEqual([{
      error,
      element: image,
      location: {
        pageIndex: 1, sectionIndex: 0, element: image, navigationElement: image
      },
      textKey: 'unitHints.loadErrors.code.image-not-loading'
    }]);
  });

  /* The texts are those of studio-lite#1788; a code without one gets a general text. */
  it('should explain each code the player reports by a text of its own, and any other in general terms', () => {
    expect(LoadErrorHints.EXPLAINED_CODES.map(code => LoadErrorHints.textKeyOf(code))).toEqual([
      'unitHints.loadErrors.code.image-not-loading',
      'unitHints.loadErrors.code.media-timeout',
      'unitHints.loadErrors.code.media-duration-error',
      'unitHints.loadErrors.code.geometry-timeout',
      'unitHints.loadErrors.code.geogebra-not-loading'
    ]);
    expect(LoadErrorHints.textKeyOf('something-new')).toBe('unitHints.loadErrors.code.other');
  });

  it('should leave out the error of an element the unit no longer holds', () => {
    const error = { code: 'image-not-loading', message: 'Failed', elementId: 'image_1' };
    unit.pages[1].sections[0].elements = [];

    expect(LoadErrorHints.resolve(unit, [error])).toEqual([]);
  });

  /* GeoGebra is all that reports without an element, and a unit without geometry does not miss it. */
  it('should list an error without an element only while the unit has a geometry element', () => {
    const error = { code: 'geogebra-not-loading', message: 'Failed' };
    expect(LoadErrorHints.resolve(unit, [error])).toEqual([]);

    unit.pages[0].sections[0].elements.push(create({ type: 'geometry', id: 'geometry_1', alias: 'geo' }));

    expect(LoadErrorHints.resolve(unit, [error])).toEqual([{
      error, element: null, location: null, textKey: 'unitHints.loadErrors.code.geogebra-not-loading'
    }]);
  });

  it('should keep the order the errors were reported in', () => {
    unit.pages[0].sections[0].elements.push(create({ type: 'image', id: 'image_2', alias: 'zweites' }));
    const errors = [
      { code: 'image-not-loading', message: 'Failed', elementId: 'image_1' },
      { code: 'image-not-loading', message: 'Failed', elementId: 'image_2' }
    ];

    expect(LoadErrorHints.resolve(unit, errors).map(hint => hint.element?.id)).toEqual(['image_1', 'image_2']);
  });
});
