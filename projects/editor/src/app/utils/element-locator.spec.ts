import { AbstractIDService } from 'common/models/id-interfaces';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { ElementLocator } from 'editor/src/app/utils/element-locator';
import { EditorSection } from 'editor/src/app/models/editor-section';

describe('ElementLocator', () => {
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
  let button: PositionedUIElement;
  let table: PositionedUIElement;

  beforeEach(() => {
    unit = new EditorUnit(undefined, idService);
    unit.pages.push(new EditorPage(undefined, idService));
    unit.pages[1].sections.push(new EditorSection(undefined, idService));
    button = create({ type: 'button', id: 'button_1', alias: 'weiter' });
    table = create({
      type: 'table',
      id: 'table_1',
      alias: 'table',
      elements: [{ type: 'text-field', id: 'text-field_1', alias: 'cell' }]
    });
    unit.pages[0].sections[0].elements.push(create({ type: 'text', id: 'text_1', alias: 'text' }));
    unit.pages[1].sections[1].elements.push(button, table);
  });

  it('should name page and section of an element the section places, and the element itself to select', () => {
    expect(ElementLocator.locate(unit, button)).toEqual({
      pageIndex: 1, sectionIndex: 1, element: button, navigationElement: button
    });
  });

  /* A cell cannot be selected on its own from outside; its table is what the section places. */
  it('should name the parent to select for a compound child', () => {
    const cell = table.getChildElements()[0];

    expect(ElementLocator.locate(unit, cell)).toEqual({
      pageIndex: 1, sectionIndex: 1, element: cell, navigationElement: table
    });
  });

  it('should find nothing for an element the unit does not hold', () => {
    expect(ElementLocator.locate(unit, create({ type: 'button', id: 'button_2', alias: 'fremd' }))).toBeNull();
  });
});
