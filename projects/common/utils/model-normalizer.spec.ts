import { ELEMENT_DEFAULTS, GLOBAL_DEFAULTS } from 'common/models/elements/element-registry';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { NESTED_GROUP_KEYS } from 'common/models/elements/property-group-interfaces';
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
    });

    /* The boundary this class no longer crosses (#1187). Position and dimensions are still built
       here; styling is not, because the element's own class builds that group from its declared
       type -- and does so with the compiler checking it, which four hand-kept lists here could
       not. What arrives at the element is pinned in element.spec.ts. */
    describe('the styling group (#1187)', () => {
      it('should leave an element without a stored styling group without one', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'text', id: 'el1' });

        expect(normalized.styling).toBeUndefined();
      });

      it('should pass a stored styling group through untouched', () => {
        const styling = { lineHeight: 200, keyTheModelNeverKnew: 'x' };
        const normalized = ModelNormalizer.normalizeElement({ type: 'radio', id: 'r1', styling });

        expect(normalized.styling).toEqual(styling);
      });
    });

    /* The flat defaults entry mixes an element's own properties with the members of its position,
       dimensions and styling groups. Only the own ones belong on the root: the groups take their
       values from the same entry, so filling both gave every element a second `width`, `fontSize` and
       `lineHeight` beside the group that holds the value anything reads (#1187).

       Two specs, because two things can go wrong and the compiler only sees one of them: that a group
       member reaches the root (the sweep), and that the skip swallows an own property whose name looks
       like a group member's -- `NoRootPropertyShadowsAGroup` states no such name exists today, and the
       second spec measures the fill for the three entries that carry the most own properties.

       The fourth group, `player`, is NOT covered -- neither by the sweep nor by the assertion. Its 16
       members from GLOBAL_DEFAULTS still reach the root of every element, `text` and `button`
       included, beside the group that `generatePlayerProps` builds from the same entry. Extending the
       skip is not a one-liner: PlayerProperties shares `fileName` with audio, video, image, geometry
       and hotspot-image and `imgSrc`/`imgFileName` with checkbox, where those are genuine root
       properties that would stop being filled. Filed separately. */
    describe('own properties and group members on the root (#1187)', () => {
      it('should write no position, dimension or styling member onto the element root, for any type', () => {
        const onRoot = (Object.keys(ELEMENT_DEFAULTS) as UIElementType[]).flatMap(type => {
          const blueprint: Record<string, unknown> = { type, id: `${type}_1` };
          if (type === 'likert') blueprint.rows = [];
          return Object.keys(ModelNormalizer.normalizeElement(blueprint))
            .filter(key => (NESTED_GROUP_KEYS as readonly string[]).includes(key))
            .map(key => `${type}.${key}`);
        });

        expect(onRoot).toEqual([]);
      });

      it('should still fill the own properties of an element', () => {
        expect(ModelNormalizer.normalizeElement({ type: 'audio', id: 'a1' }).fileName).toBe('');
        expect(ModelNormalizer.normalizeElement({ type: 'text', id: 't1' }).markingMode).toBe('selection');
        expect(ModelNormalizer.normalizeElement({ type: 'frame', id: 'f1' }).hasBorderTop).toBe(true);
      });
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

    /* #1177: the typed defaults table fixed three entries; this spec pins the
       intended VALUES the types cannot check. The styling half of #1177 and #1185
       moved to element.spec.ts with the group itself (#1187). */
    describe('defaults changed with the typed registry (#1177)', () => {
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
     it with no constructor involved). createElement is what the editor and player use; the two are
     equivalent for the object identities these sweeps are about, because whatever the normalizer
     hands out reaches the constructors unchanged -- these sweeps pin that equivalence, which nothing
     else states. The styling group is no longer part of it: the classes build that themselves
     (#1187). */
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
