import { UnitTraversalMigration } from './unit-traversal-migration';

class TestMigration extends UnitTraversalMigration {
  fromVersion = '1.0.0';
  toVersion = '1.1.0';

  // eslint-disable-next-line class-methods-use-this
  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    return { ...element, migrated: true };
  }
}

describe('UnitTraversalMigration', () => {
  let migration: TestMigration;

  beforeEach(() => {
    migration = new TestMigration();
  });

  it('should travel through pages, sections and elements', () => {
    const unit = {
      version: '1.0.0',
      pages: [
        {
          sections: [
            {
              elements: [
                { type: 'text', id: 'el1' }
              ]
            }
          ]
        }
      ]
    };

    const result = migration.execute(unit);
    expect(result.version).toBe('1.1.0');
    const pages = result.pages as { sections: { elements: Record<string, unknown>[] }[] }[];
    expect(pages[0].sections[0].elements[0].migrated).toBe(true);
  });

  /* A table cell, a likert row and the child model in a cloze document are elements like any other, and
     a step's transformation is meant for them as well. Traversal used to stop at what a section holds
     directly, so they were never handed to `migrateElement` at all (#1196). */
  describe('compound children (#1196)', () => {
    const unitWith = (element: Record<string, unknown>): Record<string, unknown> => ({
      version: '1.0.0',
      pages: [{ sections: [{ elements: [element] }] }]
    });
    const firstElement = (result: Record<string, unknown>): Record<string, unknown> => (
      (result.pages as Record<string, unknown>[])[0].sections as Record<string, unknown>[]
    )[0].elements as unknown as Record<string, unknown>;

    it('should migrate the cells of a table', () => {
      const result = migration.execute(unitWith({
        type: 'table', id: 'table_1', elements: [{ type: 'text-field', id: 'cell_1' }]
      }));

      const table = (firstElement(result) as unknown as Record<string, unknown>[])[0];
      expect(table.migrated).toBe(true);
      expect((table.elements as Record<string, unknown>[])[0].migrated).toBe(true);
    });

    it('should migrate the rows and cells of a likert element', () => {
      const result = migration.execute(unitWith({
        type: 'likert',
        id: 'likert_1',
        rows: [{ type: 'likert-row', id: 'row_1' }],
        elements: [{ type: 'radio', id: 'cell_1' }]
      }));

      const likert = (firstElement(result) as unknown as Record<string, unknown>[])[0];
      expect((likert.rows as Record<string, unknown>[])[0].migrated).toBe(true);
      expect((likert.elements as Record<string, unknown>[])[0].migrated).toBe(true);
    });

    /* Down the whole tiptap tree, not only its first level, and the node itself is left as it is -- a
       paragraph is not an element. */
    it('should migrate the child models of a cloze document', () => {
      const result = migration.execute(unitWith({
        type: 'cloze',
        id: 'cloze_1',
        document: {
          type: 'doc',
          content: [{
            type: 'paragraph',
            content: [{ type: 'TextField', attrs: { model: { type: 'text-field', id: 'child_1' } } }]
          }]
        }
      }));

      const cloze = (firstElement(result) as unknown as Record<string, unknown>[])[0];
      const document = cloze.document as Record<string, unknown>;
      const paragraph = (document.content as Record<string, unknown>[])[0];
      const node = (paragraph.content as Record<string, unknown>[])[0];

      expect(paragraph.migrated).toBeUndefined();
      expect((node.attrs as Record<string, unknown>).model).toEqual({
        type: 'text-field', id: 'child_1', migrated: true
      });
    });

    /* A document of a shape this cannot walk is handed back as it is. Spreading it would turn a string
       into an object of numbered characters -- and the normalizer, whose descent this mirrors, leaves
       such a value alone. */
    it('should leave a cloze document it cannot walk untouched', () => {
      const result = migration.execute(unitWith({ type: 'cloze', id: 'cloze_1', document: 'not a document' }));

      const cloze = (firstElement(result) as unknown as Record<string, unknown>[])[0];
      expect(cloze.document).toBe('not a document');
      expect(cloze.migrated).toBe(true);
    });

    /* The elements of a type that is not a compound stay where they are: `elements` on anything else
       is not a list of children, and the normalizer does not descend there either. */
    it('should not descend into an elements property of another type', () => {
      const result = migration.execute(unitWith({
        type: 'text', id: 'text_1', elements: [{ type: 'text-field', id: 'not_a_child' }]
      }));

      const text = (firstElement(result) as unknown as Record<string, unknown>[])[0];
      expect((text.elements as Record<string, unknown>[])[0].migrated).toBeUndefined();
    });
  });

  it('should handle missing pages/sections/elements', () => {
    const unit = {
      version: '1.0.0'
    };

    const result = migration.execute(unit);
    expect(result.version).toBe('1.1.0');
    expect(result.pages).toEqual([]);
  });
});
