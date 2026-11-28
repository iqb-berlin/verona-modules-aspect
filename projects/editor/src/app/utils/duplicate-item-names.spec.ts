import { AbstractIDService } from 'common/models/id-interfaces';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { DuplicateItemNames } from 'editor/src/app/utils/duplicate-item-names';

/* Two lists sharing a name, and nothing reported where every name is its own, are what the end-to-end test in
   `variable-info-findings.spec.cy.ts` checks in the running editor; these are the cases it does not reach. */
describe('DuplicateItemNames', () => {
  const idService = {
    getAndRegisterNewID: (idType: string): string => `${idType}_generated`,
    register: (): void => {},
    unregister: (): void => {},
    isAliasAvailable: (): boolean => true,
    changeAlias: (): void => {}
  } as unknown as AbstractIDService;

  const create = (properties: Record<string, unknown>): PositionedUIElement => ElementFactory
    .createElement(properties as unknown as UIElementProperties, idService) as PositionedUIElement;

  const item = (alias: string, text: string): Record<string, unknown> => ({ text, id: `${text}_id`, alias });

  const dropList = (id: string, ...items: Record<string, unknown>[]): PositionedUIElement => create({
    type: 'drop-list', id, alias: id, value: items
  });

  let unit: EditorUnit;

  beforeEach(() => {
    unit = new EditorUnit(undefined, idService);
  });

  /* The registry and the Verona contract take two names apart regardless of letter case (#1129). */
  it('should take two names that differ only in letter case for one (#1741)', () => {
    unit.pages[0].sections[0].elements.push(
      dropList('liste_a', item('Apfel', 'Apfel')),
      dropList('liste_b', item('apfel', 'Birne'))
    );

    expect(DuplicateItemNames.collect(unit).map(duplicate => duplicate.item.text)).toEqual(['Apfel', 'Birne']);
  });

  /* A gap cannot be selected from outside; the author is taken to the cloze it sits in. */
  it('should place the item of a cloze gap at its cloze (#1741)', () => {
    const cloze = create({
      type: 'cloze',
      id: 'cloze_1',
      alias: 'cloze',
      document: {
        type: 'doc',
        content: [{
          type: 'paragraph',
          attrs: {
            textAlign: 'left', indent: null, indentSize: 20, hangingIndent: false, margin: 0
          },
          content: [{
            type: 'DropList',
            attrs: {
              model: {
                type: 'drop-list', id: 'drop-list_gap', alias: 'luecke', value: [item('value_1', 'Apfel')]
              }
            }
          }]
        }]
      }
    });
    unit.pages[0].sections[0].elements.push(cloze, dropList('liste_a', item('value_1', 'Birne')));

    const [gapItem] = DuplicateItemNames.collect(unit);

    expect(gapItem.item.text).toBe('Apfel');
    expect(gapItem.location.navigationElement).toBe(cloze);
  });
});
