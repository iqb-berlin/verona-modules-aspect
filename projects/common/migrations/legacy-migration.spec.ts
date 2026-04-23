import { MigrationLegacy } from './legacy-migration';

describe('MigrationLegacy', () => {
  let migration: MigrationLegacy;

  beforeEach(() => {
    migration = new MigrationLegacy();
  });

  it('should have correct versions', () => {
    expect(migration.fromVersion).toBe('3.10.0');
    expect(migration.toVersion).toBe('4.10.0');
  });

  it('should migrate section visibility based on legacy properties', () => {
    const unit = {
      pages: [{
        sections: [{
          activeAfterID: 'element-1',
          activeAfterIdDelay: 500,
          elements: []
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const section = pages[0].sections as Record<string, unknown>[];
    const firstSection = section[0];

    expect(firstSection.visibilityDelay).toBe(500);
    expect(firstSection.visibilityRules).toEqual([{ id: 'element-1', operator: '≥', value: '1' }]);
    expect(firstSection.animatedVisibility).toBe(true);
  });

  it('should convert string-based grid sizes in sections to object arrays', () => {
    const unit = {
      pages: [{
        sections: [{
          gridColumnSizes: '1fr 2fr 100px',
          gridRowSizes: 'auto 1fr',
          elements: []
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const firstSection = sections[0];

    expect(firstSection.gridColumnSizes).toEqual([
      { value: '1', unit: 'fr' },
      { value: '2', unit: 'fr' },
      { value: '100', unit: 'px' }
    ]);
    expect(firstSection.gridRowSizes).toEqual([
      { value: 'au', unit: 'to' }, // Note: Slice logic in legacy results in this for 'auto'
      { value: '1', unit: 'fr' }
    ]);
  });

  it('should migrate dimension properties from legacy position settings', () => {
    const unit = {
      pages: [{
        sections: [{
          elements: [{
            type: 'text',
            width: 200,
            height: 50,
            position: {
              fixedSize: true,
              useMinHeight: false
            }
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const firstElement = elements[0];
    const dimensions = firstElement.dimensions as Record<string, unknown>;

    expect(dimensions.width).toBe(200);
    expect(dimensions.isWidthFixed).toBe(true);
    expect(dimensions.minWidth).toBe(null);
  });

  it('should migrate numeric margins to Measurement objects', () => {
    const unit = {
      pages: [{
        sections: [{
          elements: [{
            type: 'button',
            position: {
              marginLeft: 10,
              marginTop: 20
            }
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const firstElement = elements[0];
    const position = firstElement.position as Record<string, unknown>;

    expect(position.marginLeft).toEqual({ value: 10, unit: 'px' });
    expect(position.marginTop).toEqual({ value: 20, unit: 'px' });
    expect(position.marginRight).toEqual({ value: 0, unit: 'px' }); // Default fill
  });

  it('should migrate specific text input legacy properties', () => {
    const unit = {
      pages: [{
        sections: [{
          elements: [{
            type: 'text-field',
            softwareKeyboardShowFrench: true
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const firstElement = elements[0];

    expect(firstElement.addInputAssistanceToKeyboard).toBe(true);
    expect(firstElement.softwareKeyboardShowFrench).toBeUndefined();
  });
});
