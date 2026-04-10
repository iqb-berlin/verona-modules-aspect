import { UnitTraversalMigration } from './unit-traversal-migration';

/* eslint-disable class-methods-use-this */
class TestMigration extends UnitTraversalMigration {
  fromVersion = '1.0.0';
  toVersion = '2.0.0';

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const newElement = { ...element };
    if (newElement.type === 'test-type') {
      newElement.migrated = true;
    }
    return newElement;
  }
}

describe('UnitTraversalMigration', () => {
  let migration: TestMigration;

  beforeEach(() => {
    migration = new TestMigration();
  });

  it('should traverse all pages, sections, and elements', () => {
    const unit = {
      version: '1.0.0',
      pages: [{
        sections: [{
          elements: [
            { id: 'el-1', type: 'test-type' },
            { id: 'el-2', type: 'other-type' }
          ]
        }, {
          elements: [
            { id: 'el-3', type: 'test-type' }
          ]
        }]
      }, {
        sections: [{
          elements: [
            { id: 'el-4', type: 'test-type' }
          ]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];

    // Verify structural integrity
    expect(pages.length).toBe(2);
    expect((pages[0].sections as Record<string, unknown>[]).length).toBe(2);
    expect((pages[1].sections as Record<string, unknown>[]).length).toBe(1);

    // Verify migration was applied to elements
    const section0 = pages[0].sections as Record<string, unknown>[];
    const section1 = pages[1].sections as Record<string, unknown>[];

    const element1 = (section0[0].elements as Record<string, unknown>[])[0];
    const element2 = (section0[0].elements as Record<string, unknown>[])[1];
    const element3 = (section0[1].elements as Record<string, unknown>[])[0];
    const element4 = (section1[0].elements as Record<string, unknown>[])[0];

    expect(element1.migrated).toBe(true);
    expect(element2.migrated).toBeUndefined();
    expect(element3.migrated).toBe(true);
    expect(element4.migrated).toBe(true);
  });

  it('should handle missing pages or sections gracefully', () => {
    const unit = {
      version: '1.0.0'
      // pages is missing
    };

    const result = migration.execute(unit);
    expect(result.pages).toEqual([]);
    expect(result.version).toBe('2.0.0');
  });

  it('should handle null or empty pages or sections gracefully', () => {
    const unit = {
      version: '1.0.0',
      pages: [
        { sections: null },
        { sections: [] }
      ]
    };

    const result = migration.execute(unit as Record<string, unknown>);
    const pages = result.pages as Record<string, unknown>[];
    expect((pages[0].sections as Record<string, unknown>[])).toEqual([]);
    expect((pages[1].sections as Record<string, unknown>[])).toEqual([]);
  });

  it('should update the unit version to toVersion', () => {
    const unit = {
      version: '1.0.0',
      pages: []
    };
    const result = migration.execute(unit);
    expect(result.version).toBe('2.0.0');
  });
});
