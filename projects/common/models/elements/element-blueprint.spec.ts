import { UIElementType } from 'common/models/ui-element-interfaces';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { ElementFactory } from 'common/utils/element-factory';
import { UIElement } from 'common/models/elements/element';
import { AbstractIDService } from 'common/models/id-interfaces';
import { DropdownElement } from 'common/models/elements/input-group-elements/dropdown';
import {
  RadioButtonGroupElement
} from 'common/models/elements/input-group-elements/radio-button-group';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';

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

  /** Paths at which `a` and `b` hold the very same object. */
  const sharedPaths = (a: unknown, b: unknown, path: string, depth: number = 1): string[] => {
    if (depth > 6) return [];
    if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') return [];
    if (a === b) return [path];
    return Object.keys(a as Record<string, unknown>)
      .filter(key => key !== 'idService')
      .flatMap(key => sharedPaths(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        `${path}.${key}`,
        depth + 1
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
