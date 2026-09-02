import { UIElementType } from 'common/models/ui-element-interfaces';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { ElementFactory } from 'common/utils/element-factory';
import { UIElement } from 'common/models/elements/element';
import { AbstractIDService } from 'common/models/id-interfaces';
import { DropdownElement } from 'common/models/elements/dropdown';
import {
  RadioButtonGroupElement
} from 'common/models/elements/radio-button-group';
import { DropListElement } from 'common/models/elements/drop-list';
import {
  ClozeElement, CustomDocumentNode
} from 'common/models/elements/cloze';

/**
 * What a duplicate may share with its original: nothing.
 *
 * `getBlueprint()` was a shallow copy (`{ ...this }`), so a duplicated element kept the original's
 * option lists, values and measurements - and `setProperty` splices into arrays in place, so editing
 * the copy edited the original. The same applied to duplicating a section, which builds its elements
 * from the very same method (#1179).
 *
 * The sweep below is the measurement that found it, turned into a guard: it walks every element type
 * with realistically filled lists, objects and child elements, and reports every path where original
 * and duplicate hold the same object. Filled on purpose - a constructor mapping over an empty list
 * looks correct however it copies.
 */
describe('UIElement.getBlueprint', () => {
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

  /** Content per type, so that lists and nested objects are not empty. */
  const FILLING: Partial<Record<UIElementType, Record<string, unknown>>> = {
    dropdown: { options: [{ text: 'A' }, { text: 'B' }] },
    radio: { options: [{ text: 'A' }, { text: 'B' }] },
    'radio-group-images': { options: [{ text: 'A', imgSrc: null }, { text: 'B', imgSrc: null }] },
    'toggle-button': { options: [{ text: 'A' }, { text: 'B' }] },
    likert: {
      options: [{ text: 'stimmt' }, { text: 'stimmt nicht' }],
      rows: [{
        type: 'likert-row',
        id: 'row_1',
        alias: 'row_1',
        rowLabel: { text: 'Zeile', imgSrc: null, imgPosition: 'above' }
      }]
    },
    'likert-row': { rowLabel: { text: 'Zeile', imgSrc: null, imgPosition: 'above' } },
    table: {
      elements: [{ type: 'text-field', id: 'tf_1', alias: 'tf_1' }],
      gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 2, unit: 'fr' }]
    },
    'drop-list': {
      value: [{
        text: 'Wert',
        id: 'v_1',
        alias: 'v_1',
        imgSrc: null,
        imgFileName: '',
        imgPosition: 'above',
        originListID: 'dl_1',
        originListIndex: 0,
        audioSrc: null,
        audioFileName: ''
      }]
    },
    'hotspot-image': {
      value: [{
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        shape: 'rectangle',
        borderColor: '#000000',
        backgroundColor: '#ffffff',
        usedIn: '',
        rotation: 0,
        id: 'h_1',
        alias: 'h_1'
      }]
    },
    text: { markingPanels: ['panel_1'] },
    geometry: { trackedVariables: [{ id: 'v', name: 'v', trackType: 'value' }] },
    'math-table': { variableLayoutOptions: { allowArithmeticChars: true, isFirstLineUnderlined: true } },
    cloze: {
      document: {
        type: 'doc',
        content: [{
          type: 'paragraph',
          attrs: {
            textAlign: 'left', indent: null, indentSize: 20, hangingIndent: false, margin: 0
          },
          content: [{
            type: 'TextField',
            attrs: { model: { type: 'text-field', id: 'child_1', alias: 'child_1' } }
          }]
        }]
      }
    }
  };

  /* Paths at which `a` and `b` hold the very same object.
     What it replaced was a limit of six levels, one short of the child model of a cloze document -- so
     for those the sweep below reported green whatever the code did (#1194).

     Keyed on the PAIR, not on `a`: the same object can sit at two places in the original, and the
     second comparison then runs against a different counterpart. Skipping it because `a` had been seen
     would be the same kind of blindness the depth limit was. What this guards is walking one pair
     twice; nothing in a constructed element leads it in a circle today -- an object that is identical
     in both trees is reported at `a === b` before the descent, and the idService is filtered out -- so
     it is defensive. */
  const sharedPaths = (a: unknown, b: unknown, path: string,
                       visited: WeakMap<object, WeakSet<object>> = new WeakMap()): string[] => {
    if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') return [];
    if (a === b) return [path];
    const partners = visited.get(a) ?? new WeakSet<object>();
    if (partners.has(b)) return [];
    partners.add(b);
    visited.set(a, partners);
    return Object.keys(a as Record<string, unknown>)
      .filter(key => key !== 'idService')
      .flatMap(key => sharedPaths(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        `${path}.${key}`,
        visited
      ));
  };

  const duplicate = (element: UIElement): UIElement => ElementFactory.createElement(
    { ...element.getBlueprint(), type: element.type } as { type: UIElementType },
    idService
  );

  it('should leave a duplicate nothing of the original to share, for any element type', () => {
    const findings = (Object.keys(ELEMENT_DEFAULTS) as UIElementType[]).flatMap(type => {
      const original = ElementFactory.createElement(
        { type, ...(FILLING[type] ?? {}) } as { type: UIElementType }, idService
      );
      const copy = duplicate(original);
      return Object.keys(original)
        .filter(key => key !== 'idService')
        .flatMap(key => sharedPaths(
          (original as unknown as Record<string, unknown>)[key],
          (copy as unknown as Record<string, unknown>)[key],
          `${type}.${key}`
        ));
    });

    expect(findings).toEqual([]);
  });

  /* A test for the test. The walker used to stop at `depth > 6`, and a cloze child model sits at seven:
     `document.content[0].content[0].attrs.model`. The sweep above therefore reported green for cloze
     children whatever the code did (#1194). Sharing is planted here on purpose -- the child models of a
     cloze are made by its own constructor, so nothing else would produce it -- and what is asserted is
     that the walker names the path. */
  it('should reach the child model of a cloze document', () => {
    const original = ElementFactory.createElement(
      { type: 'cloze', ...FILLING.cloze } as { type: UIElementType }, idService
    ) as ClozeElement;
    const copy = duplicate(original) as ClozeElement;
    const nodeOf = (element: ClozeElement): CustomDocumentNode => (
      element.document.content[0].content[0] as CustomDocumentNode
    );
    nodeOf(copy).attrs.model = nodeOf(original).attrs.model;

    const findings = sharedPaths(original.document, copy.document, 'cloze.document');

    expect(findings).toEqual(['cloze.document.content.0.content.0.attrs.model']);
  });

  /* The second test for the test. An object at two places in the original is compared against two
     different counterparts, and a walker that remembers only where it has been would skip the second
     -- reporting green for a leak at exactly the place the first comparison came out clean. */
  it('should compare an object that sits at two places in the original at both of them', () => {
    const twice = { inner: { deep: true } };
    const original = { p1: twice, p2: twice };
    /* Copied properly at the first place, leaking the inner object at the second. A walker that
       remembers only that it has seen `twice` stops at the second place -- against a counterpart it
       never looked at. */
    const copy = { p1: { inner: { deep: true } }, p2: { inner: twice.inner } };

    expect(sharedPaths(original, copy, 'root')).toEqual(['root.p2.inner']);
  });

  it('should not put the id service into the blueprint', () => {
    const element = ElementFactory.createElement({ type: 'text-field' }, idService);

    expect('idService' in element.getBlueprint()).toBe(false);
  });

  /* The ids inside a drop list's values are cleared by `getBlueprint()` so a copy does not inherit
     them - but nothing handed out new ones, so a duplicated list had values with an empty id field
     that could not be edited. Found while reviewing #1179 in the editor; it predates that change,
     which is why it is pinned here for both paths a copy can take. */
  describe('the ids inside drop list values', () => {
    const dropListProperties = {
      type: 'drop-list' as UIElementType,
      id: 'drop-list_1',
      alias: 'drop-list_1',
      value: [{
        text: 'Wert A',
        id: 'value_1',
        alias: 'value_1',
        imgSrc: null,
        imgFileName: '',
        imgPosition: 'above',
        originListID: 'drop-list_1',
        originListIndex: 0,
        audioSrc: null,
        audioFileName: ''
      }]
    };

    it('should give a duplicated list new value ids', () => {
      const original = ElementFactory.createElement(dropListProperties, idService) as DropListElement;

      const copy = duplicate(original) as DropListElement;

      expect(copy.value[0].id).toBeTruthy();
      expect(copy.value[0].id).not.toBe(original.value[0].id);
      expect(copy.value[0].alias).toBeTruthy();
    });

    // The same list inside a cloze, which duplicates its children through their own blueprints.
    it('should give the values of a duplicated cloze new ids', () => {
      const clozeProperties = {
        type: 'cloze' as UIElementType,
        document: {
          type: 'doc',
          content: [{
            type: 'paragraph',
            attrs: {
              textAlign: 'left', indent: null, indentSize: 20, hangingIndent: false, margin: 0
            },
            content: [{ type: 'DropList', attrs: { model: dropListProperties } }]
          }]
        }
      };
      const original = ElementFactory.createElement(clozeProperties, idService);

      const copy = duplicate(original);
      const copiedList = copy.getChildElements()
        .find(child => child.type === 'drop-list') as DropListElement;

      expect(copiedList).toBeDefined();
      expect(copiedList.value[0].id).toBeTruthy();
      expect(copiedList.value[0].id).not.toBe('value_1');
    });
  });

  /* A copy needs its own identity, on every level. The child elements of a compound carry ids of their
     own, and those must not be inherited either - otherwise two elements answer to the same variable.
     Loading is the counter-case in the same code path: there the ids are present and have to stay. */
  describe('identity of copied children', () => {
    it('should give a duplicated likert new row ids', () => {
      const original = ElementFactory.createElement({
        type: 'likert',
        options: [{ text: 'ja' }, { text: 'nein' }],
        rows: [
          { type: 'likert-row', id: 'row_1', alias: 'row_1' },
          { type: 'likert-row', id: 'row_2', alias: 'row_2' }
        ]
      } as unknown as { type: UIElementType }, idService);

      const copy = duplicate(original);

      const originalIds = original.getChildElements().map(child => child.id);
      const copyIds = copy.getChildElements().map(child => child.id);
      expect(copyIds.length).toBe(2);
      expect(copyIds.every(id => !!id)).toBe(true);
      expect(copyIds.some(id => originalIds.includes(id))).toBe(false);
    });

    it('should give a duplicated table new child ids', () => {
      const original = ElementFactory.createElement({
        type: 'table',
        elements: [
          { type: 'text-field', id: 'tf_1', alias: 'tf_1' },
          { type: 'checkbox', id: 'cb_1', alias: 'cb_1' }
        ],
        gridColumnSizes: [{ value: 1, unit: 'fr' }],
        gridRowSizes: [{ value: 1, unit: 'fr' }]
      } as unknown as { type: UIElementType }, idService);

      const copy = duplicate(original);

      const originalIds = original.getChildElements().map(child => child.id);
      const copyIds = copy.getChildElements().map(child => child.id);
      expect(copyIds.length).toBe(2);
      expect(copyIds.some(id => originalIds.includes(id))).toBe(false);
    });

    it('should give a duplicated cloze new child ids', () => {
      const original = ElementFactory.createElement({
        type: 'cloze',
        document: {
          type: 'doc',
          content: [{
            type: 'paragraph',
            attrs: {
              textAlign: 'left', indent: null, indentSize: 20, hangingIndent: false, margin: 0
            },
            content: [{
              type: 'TextField',
              attrs: { model: { type: 'text-field', id: 'child_1', alias: 'child_1' } }
            }]
          }]
        }
      } as unknown as { type: UIElementType }, idService);

      const copy = duplicate(original);

      expect(copy.getChildElements().length).toBe(1);
      expect(copy.getChildElements()[0].id).toBeTruthy();
      expect(copy.getChildElements()[0].id).not.toBe(original.getChildElements()[0].id);
    });

    /* Loading is not duplicating: an element built from stored data keeps the ids it was saved with,
       including those inside a drop list's values. Only a blueprint, which has them cleared, gets new
       ones - the distinction the constructor makes since #1179. */
    it('should keep the ids when an element is built from stored data', () => {
      const stored = {
        type: 'drop-list' as UIElementType,
        id: 'drop-list_9',
        alias: 'drop-list_9',
        value: [{
          text: 'Wert',
          id: 'value_9',
          alias: 'value_9',
          imgSrc: null,
          imgFileName: '',
          imgPosition: 'above',
          originListID: 'drop-list_9',
          originListIndex: 0,
          audioSrc: null,
          audioFileName: ''
        }]
      };

      const loaded = ElementFactory.createElement(stored, idService) as DropListElement;

      expect(loaded.id).toBe('drop-list_9');
      expect(loaded.value[0].id).toBe('value_9');
      expect(loaded.value[0].alias).toBe('value_9');
    });
  });

  /* The two cases that were reproduced in the editor: what editing a duplicate does to its original.
     Through the model rather than the panel, because that is where the copy is made. */
  describe('editing a duplicate', () => {
    it('should not add an option to the original', () => {
      const original = ElementFactory.createElement(
        { type: 'dropdown', options: [{ text: 'A' }, { text: 'B' }] } as { type: UIElementType },
        idService
      ) as DropdownElement;
      const copy = duplicate(original) as DropdownElement;

      copy.options.push({ text: 'C' });

      expect(original.options.length).toBe(2);
    });

    it('should not rename an option of the original', () => {
      const original = ElementFactory.createElement(
        { type: 'radio', options: [{ text: 'A' }, { text: 'B' }] } as { type: UIElementType },
        idService
      ) as RadioButtonGroupElement;
      const copy = duplicate(original) as RadioButtonGroupElement;

      copy.options[0].text = 'A geändert';

      expect(original.options[0].text).toBe('A');
    });
  });
});
