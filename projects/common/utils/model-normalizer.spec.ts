import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { ModelNormalizer } from './model-normalizer';

describe('ModelNormalizer', () => {
  describe('normalizeUnit', () => {
    it('should backfill missing unit properties', () => {
      const partialUnit = { pages: [] };
      const normalized = ModelNormalizer.normalizeUnit(partialUnit);
      expect(normalized.type).toBe('aspect-unit-definition');
      expect(normalized.enableSectionNumbering).toBe(false);
      expect(normalized.sectionNumberingPosition).toBe('left');
    });

    it('should normalize state variables', () => {
      const unit = {
        stateVariables: [{ id: 'var1' }, { id: 'var2', alias: 'myVar' }]
      };
      const normalized = ModelNormalizer.normalizeUnit(unit as Record<string, unknown>);
      const stateVariables = normalized.stateVariables as Record<string, unknown>[];
      expect(stateVariables[0].alias).toBe('var1');
      expect(stateVariables[1].alias).toBe('myVar');
    });
  });

  describe('normalizePage', () => {
    it('should backfill missing page properties', () => {
      const partialPage = {};
      const normalized = ModelNormalizer.normalizePage(partialPage);
      expect(normalized.sections).toEqual([]);
      expect(normalized.hasMaxWidth).toBe(true);
      expect(normalized.maxWidth).toBe(750);
      expect(normalized.backgroundColor).toBe('#ffffff');
    });
  });

  describe('normalizeSection', () => {
    it('should backfill missing section properties', () => {
      const partialSection = {};
      const normalized = ModelNormalizer.normalizeSection(partialSection);
      expect(normalized.elements).toEqual([]);
      expect(normalized.height).toBe(400);
      expect(normalized.gridColumnSizes).toEqual([{ value: 1, unit: 'fr' }]);
    });
  });

  describe('normalizeElement', () => {
    it('should backfill basic element properties', () => {
      const partialElement = { type: 'text', id: 'el1' };
      const normalized = ModelNormalizer.normalizeElement(partialElement);
      expect(normalized.isRelevantForPresentationComplete).toBe(true);
      expect(normalized.dimensions).toBeDefined();
      expect(normalized.position).toBeDefined();
      expect(normalized.styling).toBeDefined();
    });

    it('should handle math-table specifically', () => {
      const partialMathTable = {
        type: 'math-table',
        id: 'mt1',
        variableLayoutOptions: { allowArithmeticChars: true }
      };
      const normalized = ModelNormalizer.normalizeElement(partialMathTable as Record<string, unknown>);
      const variableLayoutOptions = normalized.variableLayoutOptions as Record<string, unknown>;
      expect(variableLayoutOptions.allowArithmeticChars).toBe(true);
      expect(variableLayoutOptions.isFirstLineUnderlined).toBe(true); // Default backfilled
    });

    it('should recursively normalize compound elements (likert)', () => {
      const partialLikert = {
        type: 'likert',
        id: 'l1',
        elements: [{ type: 'button', id: 'b1' }]
      };
      const normalized = ModelNormalizer.normalizeElement(partialLikert as Record<string, unknown>);
      const nestedElements = normalized.elements as Record<string, unknown>[];
      expect(nestedElements[0].isRelevantForPresentationComplete).toBe(true);
    });

    /* barStyle and thumbLabel are declared boolean, but their defaults were the strings 'default' and
       'always' from 020d49fc until #1139 - and this normalizer put them into every unit that lacked
       the properties. Repaired here rather than in a versioned step, because the units carrying the
       string were already stamped 4.12.0 by a 3.0.0 beta and no migration step would touch them. */
    describe('the slider booleans', () => {
      const normalizeSlider = (properties: Record<string, unknown>): Record<string, unknown> => ModelNormalizer
        .normalizeElement({ type: 'slider', id: 's1', ...properties });

      it('should turn a leftover string into false', () => {
        const normalized = normalizeSlider({ barStyle: 'default', thumbLabel: 'always' });

        expect(normalized.barStyle).toBe(false);
        expect(normalized.thumbLabel).toBe(false);
      });

      // A boolean is somebody's choice in the panel and has to survive the repair.
      it('should keep a chosen true', () => {
        const normalized = normalizeSlider({ barStyle: true, thumbLabel: true });

        expect(normalized.barStyle).toBe(true);
        expect(normalized.thumbLabel).toBe(true);
      });

      it('should backfill missing properties as false', () => {
        const normalized = normalizeSlider({});

        expect(normalized.barStyle).toBe(false);
        expect(normalized.thumbLabel).toBe(false);
      });

      /* The defaults are what the loop above backfills with, so a non-boolean there would travel into
         every unit again - which is how this bug spread in the first place. */
      it('should have boolean defaults in the registry', () => {
        expect(typeof ELEMENT_DEFAULTS.slider.barStyle).toBe('boolean');
        expect(typeof ELEMENT_DEFAULTS.slider.thumbLabel).toBe('boolean');
      });
    });

    it('should initialize required properties for input elements', () => {
      const partialInputElement = { type: 'dropdown', id: 'dd1' };
      const normalized = ModelNormalizer.normalizeElement(partialInputElement);

      expect(normalized.required).toBe(false);
      expect(normalized.requiredWarnMessage).toBe('Eingabe erforderlich');
      expect(normalized.readOnly).toBe(false);
    });

    it('should not add required properties for non-input elements', () => {
      const partialNonInputElement = { type: 'button', id: 'btn1' };
      const normalized = ModelNormalizer.normalizeElement(partialNonInputElement);

      expect(normalized.required).toBeUndefined();
      expect(normalized.requiredWarnMessage).toBeUndefined();
      expect(normalized.readOnly).toBeUndefined();
    });

    it('should add border properties only to specific element types', () => {
      const button = ModelNormalizer.normalizeElement({ type: 'button', id: 'b1' });
      const text = ModelNormalizer.normalizeElement({ type: 'text', id: 't1' });

      expect((button.styling as Record<string, unknown>).borderWidth).toBeDefined();
      expect((text.styling as Record<string, unknown>).borderWidth).toBeUndefined();
    });
  });
});
