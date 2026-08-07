import { ELEMENT_DEFAULTS, GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { ModelNormalizer } from './model-normalizer';

/* Every object reachable from the defaults tables, as identities. Built ONCE from the whole table, not
   per element type: a text element holding image's Measurement is just as wrong as one holding its
   own, and a per-type set cannot see that. The `acc` guard deduplicates -- the tables are plain data
   and acyclic. */
const registryOwned = (source: unknown, acc: Set<unknown> = new Set()): Set<unknown> => {
  if (source !== null && typeof source === 'object' && !acc.has(source)) {
    acc.add(source);
    Object.values(source as Record<string, unknown>).forEach(value => registryOwned(value, acc));
  }
  return acc;
};

const OWNED_BY_REGISTRY = registryOwned({ ELEMENT_DEFAULTS, GLOBAL_DEFAULTS });

/* The idService skip is taken from element-blueprint.spec.ts's walker; `visited` is NOT -- that one
   bounds recursion with `depth > 6`, which is why it never reaches a cloze child (#1194). A visited set
   does the same job without a cutoff, and it is needed here because a constructed element holds
   services that reference each other. It costs reported paths, not findings: a registry object
   reachable twice is named once, at whichever path the walk hit first. */
const registryObjectsIn = (node: unknown, path: string, visited: WeakSet<object> = new WeakSet()): string[] => {
  if (node === null || typeof node !== 'object' || visited.has(node)) return [];
  visited.add(node);
  return (OWNED_BY_REGISTRY.has(node) ? [path] : []).concat(
    Object.entries(node as Record<string, unknown>)
      .filter(([key]) => key !== 'idService')
      .flatMap(([key, value]) => registryObjectsIn(value, `${path}.${key}`, visited))
  );
};

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

    /* #1185: the styling group is rebuilt from scratch, so an extra styling key
       survives a load only because EXTRA_STYLING_KEYS names it. These specs pin
       both directions the catalogue is responsible for. */
    describe('extra styling keys (#1185)', () => {
      it('lifts an extra styling default into the styling group', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'toggle-button', id: 'tb1' });
        expect((normalized.styling as Record<string, unknown>).selectionColor).toBe('#c9e0e0');
      });

      it('keeps a stored extra styling value instead of overwriting it with the default', () => {
        const normalized = ModelNormalizer.normalizeElement({
          type: 'likert', id: 'l2', rows: [], styling: { lineColoring: false }
        });
        expect((normalized.styling as Record<string, unknown>).lineColoring).toBe(false);
      });
    });

    /* #1177: the typed defaults table fixed three entries; these specs pin the
       intended VALUES and the normalizer behavior the types cannot check. */
    describe('defaults changed with the typed registry (#1177)', () => {
      it('lifts the radio lineHeight default into styling when the unit has none', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'radio', id: 'r1' });
        expect((normalized.styling as Record<string, unknown>).lineHeight).toBe(100);
      });

      it('preserves a stored radio styling.lineHeight instead of dropping it', () => {
        const normalized = ModelNormalizer.normalizeElement({
          type: 'radio', id: 'r1', styling: { lineHeight: 200 }
        });
        expect((normalized.styling as Record<string, unknown>).lineHeight).toBe(200);
      });

      it('lifts the spell-correct lineHeight default into styling', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'spell-correct', id: 's1' });
        expect((normalized.styling as Record<string, unknown>).lineHeight).toBe(135);
      });

      it('no longer backfills the retired rowID key into likert rows', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'likert-row', id: 'lr1' });
        expect(normalized.rowID).toBeUndefined();
      });
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

    /* This is how #1139 spread: the loop above backfills every missing property from the defaults, and
       the slider's two display switches had the strings 'default' and 'always' there while being
       declared boolean. Every unit that lacked them got the string written into it. No repair for
       stored values is needed - the only units carrying one were saved by a 3.0.0 beta and are
       throwaway data - so what has to hold is that the defaults themselves are booleans. */
    describe('the slider booleans', () => {
      it('should backfill missing properties as false', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'slider', id: 's1' });

        expect(normalized.barStyle).toBe(false);
        expect(normalized.thumbLabel).toBe(false);
      });

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

  /* #1184: no element may hold an object that ELEMENT_DEFAULTS or GLOBAL_DEFAULTS owns, or an in-place
     write reaches the table and moves the value for every element of that type. The fix is in
     generatePositionProps (the four margins were forwarded by reference); these sweeps guard the
     invariant rather than that one line, by comparing IDENTITY over all types -- so a new
     object-valued default, or a new generator that forwards one, is caught without editing them.

     What they do NOT cover, so the heading is not read as more than it is: sharing that does not
     originate in the tables. The base constructor merges the INCOMING properties object shallowly, and
     the editor's position write path hands one Measurement to every selected element (#1193).

     PAYLOAD gives the compound types real children -- a bare `{ type }` leaves rows/elements/document
     empty, so the recursion would never run.

     Two boundaries. normalizeElement is a production boundary of its own (NormalizationMigration calls
     it with no constructor involved). createElement is what the editor and player use; today it is
     equivalent, because the normalizer fills every key and the constructors overwrite their class
     fields from it -- these sweeps pin that equivalence, which nothing else states. */
  describe('objects the registry owns (#1184)', () => {
    const PAYLOAD: Partial<Record<UIElementType, Record<string, unknown>>> = {
      cloze: {
        document: {
          type: 'doc',
          content: [{
            type: 'paragraph',
            content: [{ type: 'TextField', attrs: { model: { type: 'text-field', id: 'child_1' } } }]
          }]
        }
      },
      table: { elements: [{ type: 'text', id: 'cell_1' }] },
      likert: { rows: [{ type: 'likert-row', id: 'row_1' }] }
    };

    const allTypes = Object.keys(ELEMENT_DEFAULTS) as UIElementType[];
    const blueprintFor = (type: UIElementType) => ({ type, ...(PAYLOAD[type] ?? {}) });

    ([
      ['normalizeElement', (type: UIElementType) => ModelNormalizer.normalizeElement(blueprintFor(type))],
      ['ElementFactory.createElement', (type: UIElementType) => ElementFactory.createElement(blueprintFor(type))]
    ] as const).forEach(([name, build]) => {
      it(`should hand out no registry object from ${name}, for any type`, () => {
        const findings = allTypes.flatMap(type => registryObjectsIn(build(type), type));

        expect(findings).toEqual([]);
      });
    });
  });
});
