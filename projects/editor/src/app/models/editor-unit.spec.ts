import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElement } from 'common/models/elements/element';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';

/**
 * `deleteElements` reports what it took out, and the caller releases exactly those IDs. A page or a
 * unit that dropped a section's answer on the way up would leave IDs reserved, or release IDs of
 * elements that are still there - which is what #1262 was about.
 */
describe('EditorUnit', () => {
  let idCounter = 0;
  const idService = {
    getAndRegisterNewID: (idType: string, alias?: boolean): string => {
      idCounter += 1;
      return `${idType}_${alias ? 'alias_' : ''}${idCounter}`;
    },
    register: (): void => {},
    unregister: (): void => {},
    isAliasAvailable: (): boolean => true,
    changeAlias: (): void => {}
  } as unknown as AbstractIDService;

  const createElement = (id: string): PositionedUIElement => ElementFactory.createElement({
    type: 'text', id, alias: id
  } as unknown as UIElementProperties, idService) as PositionedUIElement;

  /* Two pages with a section each, so an answer that only ever comes from the first one shows up. */
  const unitWithElements = (elements: UIElement[]): EditorUnit => {
    const unit = new EditorUnit(undefined, idService);
    unit.pages.push(new EditorPage(undefined, idService));
    unit.pages[0].sections[0].elements.push(elements[0] as PositionedUIElement);
    unit.pages[1].sections[0].elements.push(elements[1] as PositionedUIElement);
    return unit;
  };

  it('should take out elements from every page and report all of them', () => {
    const elements = [createElement('text_1'), createElement('text_2')];
    const unit = unitWithElements(elements);

    const deletedElements = unit.deleteElements(elements);

    expect(deletedElements).toEqual(elements);
    expect(unit.getAllElements()).toEqual([]);
  });

  it('should report only the elements it found', () => {
    const elements = [createElement('text_1'), createElement('text_2')];
    const unit = unitWithElements(elements);
    const strayElement = createElement('text_3');

    const deletedElements = unit.deleteElements([elements[1], strayElement]);

    expect(deletedElements).toEqual([elements[1]]);
    expect(unit.getAllElements()).toEqual([elements[0]]);
  });
});
