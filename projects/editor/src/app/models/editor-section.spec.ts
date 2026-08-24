import { SectionProperties } from 'common/models/section';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { AbstractIDService } from 'common/models/id-interfaces';
import { DropdownElement } from 'common/models/elements/input-group-elements/dropdown';
import { EditorSection } from 'editor/src/app/models/editor-section';

/**
 * Duplicating a section goes through `UIElement.getBlueprint()` for its elements and through the
 * `Section` constructor for its own values. Both were shallow copies, so a duplicated section shared
 * its elements' option lists and its own column and row sizes with the original - editing one changed
 * the other, and the editor has no undo (#1179).
 */
describe('EditorSection', () => {
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

  const sectionProperties = (elements: UIElementProperties[]): SectionProperties => ({
    elements,
    height: 400,
    backgroundColor: '#ffffff',
    dynamicPositioning: true,
    autoColumnSize: true,
    autoRowSize: true,
    gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 2, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }],
    visibilityDelay: 0,
    animatedVisibility: false,
    enableReHide: false,
    logicalConnectiveOfRules: 'disjunction',
    visibilityRules: [{ id: 'text-field_1', operator: '=', value: 'x' }],
    ignoreNumbering: false
  } as unknown as SectionProperties);

  const sectionWithDropdown = (): EditorSection => new EditorSection(sectionProperties([{
    type: 'dropdown',
    id: 'dropdown_1',
    alias: 'dropdown_1',
    options: [{ text: 'A' }, { text: 'B' }]
  } as unknown as UIElementProperties]), idService);

  const sectionWithTable = (): EditorSection => new EditorSection(sectionProperties([{
    type: 'table',
    id: 'table_1',
    alias: 'table_1',
    elements: [{ type: 'text-field', id: 'tf_1', alias: 'tf_1' }],
    gridColumnSizes: [{ value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }]
  } as unknown as UIElementProperties]), idService);

  describe('getDuplicate', () => {
    it('should give the copy its own column and row sizes', () => {
      const original = sectionWithDropdown();

      const copy = original.getDuplicate();

      expect(copy.gridColumnSizes[0]).not.toBe(original.gridColumnSizes[0]);
      copy.gridColumnSizes[0].value = 99;
      expect(original.gridColumnSizes[0].value).toBe(1);
    });

    it('should give the copy its own visibility rules', () => {
      const original = sectionWithDropdown();

      const copy = original.getDuplicate();

      expect(copy.visibilityRules[0]).not.toBe(original.visibilityRules[0]);
    });

    /* The elements travel through getBlueprint(), so this is the section-level counterpart of the
       sweep in element-blueprint.spec.ts. */
    it('should give the copy its own element option list', () => {
      const original = sectionWithDropdown();

      const copy = original.getDuplicate();
      const originalDropdown = original.elements[0] as DropdownElement;
      const copiedDropdown = copy.elements[0] as DropdownElement;

      expect(copiedDropdown.options).not.toBe(originalDropdown.options);
      copiedDropdown.options.push({ text: 'C' });

      expect(originalDropdown.options.length).toBe(2);
    });

    /* A compound element in the section: its children carry ids of their own, and a duplicate must not
       answer to the original's variables. */
    it('should give the children of a copied table new ids', () => {
      const original = sectionWithTable();

      const copy = original.getDuplicate();

      const originalChildIds = original.elements[0].getChildElements().map(child => child.id);
      const copiedChildIds = copy.elements[0].getChildElements().map(child => child.id);
      expect(copiedChildIds.length).toBe(1);
      expect(copiedChildIds[0]).toBeTruthy();
      expect(originalChildIds).not.toContain(copiedChildIds[0]);
    });

    it('should give the copied element a new id', () => {
      const original = sectionWithDropdown();

      const copy = original.getDuplicate();

      expect(copy.elements[0].id).not.toBe(original.elements[0].id);
    });
  });

  describe('deleteElements', () => {
    it('should take out the named elements and report them', () => {
      const section = sectionWithDropdown();
      const dropdown = section.elements[0];

      const deletedElements = section.deleteElements([dropdown]);

      expect(section.elements).toEqual([]);
      expect(deletedElements).toEqual([dropdown]);
    });

    /* A child of a compound element is not on the section level. Reporting it as deleted was what
       released its ID while the child stayed in the table (#1262). */
    it('should leave a compound child in place and report nothing', () => {
      const section = sectionWithTable();
      const child = section.elements[0].getChildElements()[0];

      const deletedElements = section.deleteElements([child]);

      expect(section.elements.length).toBe(1);
      expect(section.elements[0].getChildElements()).toEqual([child]);
      expect(deletedElements).toEqual([]);
    });

    /* Two elements can share an ID once one has been handed out twice, and that is exactly the state
       this method used to produce. Identity keeps it from taking out the other one. */
    it('should take out the given element, not another one carrying the same id', () => {
      const section = sectionWithDropdown();
      const dropdown = section.elements[0];
      const twin = sectionWithDropdown();
      expect(twin.elements[0].id).toBe(dropdown.id);

      const deletedElements = twin.deleteElements([dropdown]);

      expect(twin.elements.length).toBe(1);
      expect(deletedElements).toEqual([]);
    });
  });

  /* Saving and loading is the other path a section takes, and it must behave the opposite way: the ids
     are part of the stored data and have to survive. The JSON round trip is what the clipboard and the
     insert dialog do, with `idService` stripped on the way out. */
  describe('a section through a JSON round trip', () => {
    it('should keep its ids and elements', () => {
      const original = sectionWithDropdown();

      const serialized = JSON.stringify(original, (key, value) => (key === 'idService' ? undefined : value));
      const loaded = new EditorSection(JSON.parse(serialized), idService);

      expect(loaded.elements.length).toBe(1);
      expect(loaded.elements[0].id).toBe(original.elements[0].id);
      expect((loaded.elements[0] as DropdownElement).options.length).toBe(2);
      expect(loaded.gridColumnSizes).toEqual(original.gridColumnSizes);
    });
  });
});
