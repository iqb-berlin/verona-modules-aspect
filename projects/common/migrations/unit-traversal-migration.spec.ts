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
    expect((result.pages as any[])[0].sections[0].elements[0].migrated).toBe(true);
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
