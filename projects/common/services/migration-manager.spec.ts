import { MigrationManager } from 'common/services/migration-manager';
import { UnitProperties } from 'common/models/unit';
import { TextProperties } from 'common/models/elements/text-group-elements/text';
import { ClozeProperties, CustomDocumentNode } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { TableProperties } from 'common/models/elements/compound-group-elements/table/table';
import { TextFieldProperties } from 'common/models/elements/text-input-group-elements/text-field';
import { ElementFactory } from 'common/utils/element-factory';
import { UIElementProperties } from 'common/models/ui-element-interfaces';

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
      /* Styling is the element class's own group since #1187, so a child stored without one is
         migrated without one -- what has to hold is that the default still reaches the element. */
      expect(textField.styling).toBeUndefined();
      expect(ElementFactory.createElement(textField as unknown as UIElementProperties).styling?.fontSize)
        .toBe(20);

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

  /* Which units a step reaches, and which it cannot. Both directions matter when deciding whether a
     repair belongs in a step or in the ModelNormalizer, and the answer is not obvious from the filter
     expression alone - see the class comment. Measured on the audio margin, because that is a
     transformation only Migration4m10To4m11 performs: the normalizer would never subtract anything. */
  describe('which units a step reaches', () => {
    const unitWithAudioMargin = (version: string): Record<string, unknown> => ({
      type: 'aspect-unit-definition',
      version,
      pages: [{
        sections: [{
          elements: [{
            type: 'audio',
            id: 'audio_1',
            position: { marginTop: { value: 20, unit: 'px' } }
          }]
        }]
      }]
    });

    const marginTopOf = (unit: Record<string, unknown>): number => {
      const pages = unit.pages as Record<string, unknown>[];
      const sections = pages[0].sections as Record<string, unknown>[];
      const elements = sections[0].elements as Record<string, unknown>[];
      const position = elements[0].position as Record<string, unknown>;
      return (position.marginTop as Record<string, unknown>).value as number;
    };

    it('should run a step for a unit older than its target version', () => {
      const migrated = MigrationManager.migrate(unitWithAudioMargin('4.10.0'), '4.12.0');

      expect(marginTopOf(migrated)).toBe(16);
    });

    /* The trap: a unit already stamped with the step's target version is skipped, even when migrating
       to something newer. Data written by a version whose step exists is therefore beyond that step's
       reach - repairing it needs a newer version to migrate to, or the normalizer. */
    it('should skip a step for a unit that already carries its target version', () => {
      const migrated = MigrationManager.migrate(unitWithAudioMargin('4.11.0'), '4.12.0');

      expect(marginTopOf(migrated)).toBe(20);
    });
  });

  /* What must survive MigrationLegacy losing its reach over these units is the STORED data -- the
     reasoning is on the declaration in {@link MigrationLegacy} (#1190).

     The fixture is stamped 4.0.0 ON PURPOSE: that is the boundary the defect moved. A fixture from
     the middle of the range would still pass if someone set toVersion to 4.1.0, which would re-open
     the bug for every 4.0/4.1/4.2 unit. Note this covers MigrationLegacy only; Migration4m10To4m11
     still reaches these units and mangles audio elements, which is why none is in the fixture. */
  describe('a unit that already carries the 4.x shape', () => {
    const unit4x = (): Record<string, unknown> => ({
      type: 'aspect-unit-definition',
      version: '4.0.0',
      pages: [{
        sections: [{
          visibilityRules: [{ id: 'text_1', operator: '=', value: 'ok' }],
          visibilityDelay: 500,
          animatedVisibility: true,
          elements: [
            {
              type: 'text',
              id: 'text_1',
              text: 'Bestand',
              dimensions: {
                width: 333, height: 111, isWidthFixed: true, isHeightFixed: true, minWidth: 300, maxWidth: 400
              }
            },
            {
              type: 'text-field',
              id: 'text_field_1',
              addInputAssistanceToKeyboard: true
            }
          ]
        }]
      }]
    });

    const migrate4x = (): UnitProperties => MigrationManager
      .migrate(unit4x(), '4.12.0') as unknown as UnitProperties;

    it('should keep the stored dimensions instead of falling back to the element defaults', () => {
      const element = migrate4x().pages[0].sections[0].elements[0] as unknown as TextProperties;

      expect(element.dimensions?.width).toBe(333);
      expect(element.dimensions?.height).toBe(111);
      expect(element.dimensions?.isWidthFixed).toBe(true);
      expect(element.dimensions?.minWidth).toBe(300);
      expect(element.dimensions?.maxWidth).toBe(400);
    });

    it('should keep the stored section visibility', () => {
      const section = migrate4x().pages[0].sections[0];

      expect(section.visibilityRules).toEqual([{ id: 'text_1', operator: '=', value: 'ok' }]);
      expect(section.visibilityDelay).toBe(500);
      expect(section.animatedVisibility).toBe(true);
    });

    it('should keep a stored addInputAssistanceToKeyboard on a text input element', () => {
      const element = migrate4x().pages[0].sections[0].elements[1] as unknown as TextFieldProperties;

      expect(element.addInputAssistanceToKeyboard).toBe(true);
    });

    /* Documents the target state rather than guarding the fix: migrate() stamps the version
       unconditionally and NormalizationMigration fills the defaults whatever the step filter did, so
       these three hold with or without #1190. They are here to state what "brought up to date" means
       for such a unit -- the regression protection sits in the three tests above. */
    it('should still arrive at the target version with its defaults filled', () => {
      const migrated = migrate4x();
      const element = migrated.pages[0].sections[0].elements[0] as unknown as TextProperties;

      expect(migrated.version).toBe('4.12.0');
      expect(element.markingMode).toBe('selection');
      expect(ElementFactory.createElement(element as unknown as UIElementProperties).styling?.lineHeight)
        .toBe(135);
    });
  });

  /* The counter-check: a genuine 3.10 unit must still be converted, or the fix above would have been
     bought by disabling the step. */
  it('should still convert the 3.10 shape of a legacy unit', () => {
    const legacyUnit = {
      type: 'aspect-unit-definition',
      version: '3.10.0',
      pages: [{
        sections: [{
          activeAfterID: 'text_1',
          activeAfterIdDelay: 500,
          elements: [{
            type: 'text', id: 'text_1', text: 'Legacy', width: 250, height: 60
          }]
        }]
      }]
    };

    const migrated = MigrationManager.migrate(legacyUnit, '4.12.0') as unknown as UnitProperties;
    const section = migrated.pages[0].sections[0];
    const element = section.elements[0] as unknown as TextProperties;

    expect(element.dimensions?.width).toBe(250);
    expect(element.dimensions?.height).toBe(60);
    expect(section.visibilityRules).toEqual([{ id: 'text_1', operator: '≥', value: '1' }]);
    expect(section.visibilityDelay).toBe(500);
  });
});
