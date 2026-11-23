import { AbstractIDService } from 'common/models/id-interfaces';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { UnitDependencyCollector } from 'editor/src/app/utils/unit-dependency-collector';

describe('UnitDependencyCollector (#1709)', () => {
  const idService = {
    getAndRegisterNewID: (idType: string): string => `${idType}_generated`,
    register: (): void => {},
    unregister: (): void => {},
    isAliasAvailable: (): boolean => true,
    changeAlias: (): void => {}
  } as unknown as AbstractIDService;

  const create = (type: string, id: string): PositionedUIElement => ElementFactory
    .createElement({ type, id, alias: id } as unknown as UIElementProperties, idService) as PositionedUIElement;

  let unit: EditorUnit;

  beforeEach(() => {
    unit = new EditorUnit(undefined, idService);
    unit.pages.push(new EditorPage(undefined, idService));
    unit.pages[0].sections[0].elements.push(create('text-field', 'text-field_1'));
  });

  it('should name GeoGebra once for playing and once for editing, wherever the geometry elements are', () => {
    unit.pages[1].sections[0].elements.push(create('geometry', 'geometry_1'), create('geometry', 'geometry_2'));

    expect(UnitDependencyCollector.collect(unit)).toEqual({
      dependenciesToPlay: [{ id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }],
      dependenciesToEdit: [{ id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }]
    });
  });

  it('should name each widget once, for playing only', () => {
    unit.pages[1].sections[0].elements.push(
      create('widget-molecule-editor', 'molecule_1'),
      create('widget-periodic-table', 'periodic_1'),
      create('widget-molecule-editor', 'molecule_2')
    );

    const { dependenciesToPlay, dependenciesToEdit } = UnitDependencyCollector.collect(unit);

    expect(dependenciesToPlay).toHaveLength(2);
    expect(dependenciesToPlay).toEqual(expect.arrayContaining([
      { id: 'PERIODIC_TABLE', type: 'WIDGET' },
      { id: 'MOLECULE_EDITOR', type: 'WIDGET' }
    ]));
    expect(dependenciesToEdit).toEqual([]);
  });

  it('should name nothing for a unit without geometry and widgets', () => {
    unit.pages[1].sections[0].elements.push(create('button', 'button_1'));

    expect(UnitDependencyCollector.collect(unit)).toEqual({ dependenciesToPlay: [], dependenciesToEdit: [] });
  });
});
