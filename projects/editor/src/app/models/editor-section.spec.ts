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

    it('should give the copied element a new id', () => {
      const original = sectionWithDropdown();

      const copy = original.getDuplicate();

      expect(copy.elements[0].id).not.toBe(original.elements[0].id);
    });
  });
});
