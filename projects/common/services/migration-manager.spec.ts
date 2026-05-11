import { MigrationManager } from 'common/services/migration-manager';
import { UnitProperties } from 'common/models/unit';
import { TextProperties } from 'common/models/elements/text/text';
import { ClozeProperties, CustomDocumentNode } from 'common/models/elements/compound-elements/cloze/cloze';
import { TableProperties } from 'common/models/elements/compound-elements/table/table';
import { TextFieldProperties } from 'common/models/elements/input-elements/text-field';

describe('MigrationManager', () => {
  it('should normalize legacy elements during migration', () => {
    const legacyUnit = {
      type: 'aspect-unit-definition',
      version: '3.10.0',
      pages: [
        {
          sections: [
            {
              elements: [
                {
                  type: 'text',
                  id: 'text_1',
                  text: 'Legacy Text',
                  dimensions: {
                    width: 100,
                    height: 50,
                    isWidthFixed: false,
                    isHeightFixed: false
                  },
                  position: {
                    xPosition: 0,
                    yPosition: 0,
                    gridColumn: null,
                    gridColumnRange: 1,
                    gridRow: null,
                    gridRowRange: 1,
                    marginLeft: { value: 0, unit: 'px' },
                    marginRight: { value: 0, unit: 'px' },
                    marginTop: { value: 0, unit: 'px' },
                    marginBottom: { value: 0, unit: 'px' },
                    zIndex: 0
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const migratedUnit = MigrationManager.migrate(legacyUnit, '4.11.0') as unknown as UnitProperties;
    expect(migratedUnit.version).toBe('4.11.0');
    const element = migratedUnit.pages[0].sections[0].elements[0] as unknown as TextProperties;

    // Check if missing properties are filled
    expect(element.markingMode).toBe('selection');
    expect(element.markingPanels).toEqual([]);
    expect(element.highlightableOrange).toBe(false);

    // Check if element-specific height default (98) was applied
    expect(element.dimensions?.height).toEqual(98);
  });

  describe('Compound Normalization', () => {
    it('should normalize elements inside a Cloze document during migration', () => {
      const legacyUnit = {
        type: 'aspect-unit-definition',
        version: '4.10.0',
        pages: [{
          sections: [{
            elements: [{
              type: 'cloze',
              id: 'cloze_1',
              document: {
                type: 'doc',
                content: [{
                  type: 'paragraph',
                  content: [{
                    type: 'TextField',
                    attrs: {
                      model: {
                        type: 'text-field',
                        id: 'child_1'
                        // Missing many properties like required, readOnly, styling
                      }
                    }
                  }]
                }]
              }
            }]
          }]
        }]
      };

      const migratedUnit = MigrationManager.migrate(legacyUnit, '4.11.0') as unknown as UnitProperties;
      const cloze = migratedUnit.pages[0].sections[0].elements[0] as unknown as ClozeProperties;
      const textField = (cloze.document.content[0].content[0] as CustomDocumentNode)
        .attrs.model as unknown as TextFieldProperties;

      // Check if missing properties are filled in the child element
      expect(textField.required).toBe(false);
      expect(textField.readOnly).toBe(false);
      expect(textField.requiredWarnMessage).toBe('Eingabe erforderlich');
      expect(textField.styling).toBeDefined();
      expect(textField.styling?.fontSize).toBe(20);

      // Check if dimensions are filled
      expect(textField.dimensions).toBeDefined();
      expect(textField.dimensions?.width).toBe(180);
    });

    it('should normalize elements inside a Table during migration', () => {
      const legacyUnit = {
        type: 'aspect-unit-definition',
        version: '4.10.0',
        pages: [{
          sections: [{
            elements: [{
              type: 'table',
              id: 'table_1',
              elements: [{
                type: 'text-field',
                id: 'child_2'
                // Missing everything
              }]
            }]
          }]
        }]
      };

      const migratedUnit = MigrationManager.migrate(legacyUnit, '4.11.0') as unknown as UnitProperties;
      const table = migratedUnit.pages[0].sections[0].elements[0] as unknown as TableProperties;
      const textField = table.elements[0] as unknown as TextFieldProperties;

      expect(textField.required).toBe(false);
      expect(textField.dimensions?.width).toBe(180);
    });
  });

  it('should update the version to targetVersion even if no steps are applicable', () => {
    const unit = {
      type: 'aspect-unit-definition',
      version: '4.11.0',
      pages: []
    };

    const migratedUnit = MigrationManager.migrate(unit, '4.12.0');
    expect(migratedUnit.version).toBe('4.12.0');
  });
});
