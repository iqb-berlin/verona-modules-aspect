import { ELEMENT_DEFAULTS, GLOBAL_DEFAULTS, GROUP_SECTIONS } from 'common/models/elements/element-registry';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-input-group-elements/text-field-simple';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { TextAreaElement } from 'common/models/elements/text-input-group-elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/text-input-group-elements/spell-correct';
import { TextAreaMathElement } from 'common/models/elements/text-input-group-elements/text-area-math';
import { TextInputElement } from 'common/models/elements/element';
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

    /* What lands on an element's root, measured against the entry rather than against a list of names:
       every own key of the entry has to be there, and nothing beyond it except what this class adds
       itself. Both directions matter and the compiler sees neither -- a group member on the root is
       junk that nothing reads (#1187, and its player half #1223), while an own property missing from
       the root is a default that silently stopped arriving (#1177, #1185).

       Grouped entries make the measurement exact: before #1224 the entry was flat, so "own key" could
       only be guessed by name and the sweep had to be limited to naming what must NOT be there. */
    describe('own properties and group members on the root (#1187, #1223)', () => {
      /* Not from the entry: `type` and `id` come with the blueprint, the other three are built here.
         Nothing else is: since #1228 there is no property this class hands out by element type. */
      const ADDED_HERE = ['type', 'id', 'isRelevantForPresentationComplete', 'position', 'dimensions'];

      const allTypes = Object.keys(ELEMENT_DEFAULTS) as UIElementType[];
      const ownKeysOf = (type: UIElementType): string[] => Object.keys(ELEMENT_DEFAULTS[type])
        .filter(key => !(GROUP_SECTIONS as readonly string[]).includes(key));
      const rootKeysOf = (type: UIElementType): string[] => {
        const blueprint: Record<string, unknown> = { type, id: `${type}_1` };
        if (type === 'likert') blueprint.rows = [];
        return Object.keys(ModelNormalizer.normalizeElement(blueprint));
      };

      it('should write nothing onto the element root that is not an own property, for any type', () => {
        const unexpected = allTypes.flatMap(type => {
          const allowed = [
            ...ownKeysOf(type), ...ADDED_HERE,
            ...('player' in ELEMENT_DEFAULTS[type] ? ['player'] : []),
            ...(type === 'likert' ? ['rows'] : [])
          ];
          return rootKeysOf(type).filter(key => !allowed.includes(key)).map(key => `${type}.${key}`);
        });

        expect(unexpected).toEqual([]);
      });

      it('should fill every own property of an entry onto the element root, for any type', () => {
        const missing = allTypes.flatMap(type => {
          const onRoot = rootKeysOf(type);
          return ownKeysOf(type).filter(key => !onRoot.includes(key)).map(key => `${type}.${key}`);
        });

        expect(missing).toEqual([]);
      });

      /* Which types MAY carry the section is a compile error since #1241 (`GroupedDefaults` allows it
         only where the interface declares the group); this measures what the normalizer then does with
         it. Image was in this list until #1241, on the strength of the optional `player` every element
         inherits -- it got a group nothing reads and an inspector button that did nothing.

         Sorted, because the set is the claim and the order of the table is not. */
      it('should build the player group for exactly the types whose entry has that section', () => {
        const withGroup = allTypes.filter(type => ModelNormalizer.normalizeElement(
          { type, id: `${type}_1`, ...(type === 'likert' ? { rows: [] } : {}) }
        ).player !== undefined);

        expect(withGroup.sort()).toEqual(['audio', 'video']);
      });

      /* A stored group passes through here even for an element whose entry has no section -- this class
         does not decide group membership, the element's class does, and it drops what it does not
         declare (`the player group an element keeps` in element.spec.ts, #1241). The same layering as
         for styling: the normalizer hands values along, the constructor is the whitelist (#1187). */
      it('should pass a stored player group through for an element whose entry has no section', () => {
        const normalized = ModelNormalizer.normalizeElement({
          type: 'image', id: 'image_1', player: { minRuns: 3 }
        });

        expect((normalized.player as { minRuns: number }).minRuns).toBe(3);
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

    /* The three switches were `true` up to the 2.12 release and reached a new element from the class
       field of TextInputElement; the same three sat in PropertyGroupGenerators with a `false`
       fallback. Merging both into one flat table let the fallback win, and every text input was
       created with its keyboard off (#1235). math-table is the counter-case: it declared `false`
       for itself back then and has to keep it -- which is why the values are pinned here and not
       derived from anything. */
    describe('the keyboard switches of the text inputs (#1235)', () => {
      const KEYBOARD_ON = ['text-field', 'text-field-simple', 'text-area', 'spell-correct', 'text-area-math'];
      const KEYBOARD_ON_CONSTRUCTORS: [string, () => TextInputElement][] = [
        ['text-field', () => new TextFieldElement({ type: 'text-field', id: 'tf_2' })],
        ['text-field-simple', () => new TextFieldSimpleElement({ type: 'text-field-simple', id: 'tfs_2' })],
        /* rowCount is what makes the blueprint pass this one's type guard - without it the
           constructor throws under `strictInstantiation` instead of reaching its class fields. */
        ['text-area', () => new TextAreaElement({ type: 'text-area', id: 'ta_2', rowCount: 3 })],
        ['spell-correct', () => new SpellCorrectElement({ type: 'spell-correct', id: 'sc_2' })],
        ['text-area-math', () => new TextAreaMathElement({ type: 'text-area-math', id: 'tam_2' })]
      ];

      it.each(KEYBOARD_ON)('should create %s with its keyboard on', type => {
        const normalized = ModelNormalizer.normalizeElement({ type, id: `${type}_1` });

        expect(normalized.showSoftwareKeyboard).toBe(true);
        expect(normalized.addInputAssistanceToKeyboard).toBe(true);
        expect(normalized.hideNativeKeyboard).toBe(true);
      });

      it('should leave the math table without a keyboard', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'math-table', id: 'mt1' });

        expect(normalized.showSoftwareKeyboard).toBe(false);
        expect(normalized.addInputAssistanceToKeyboard).toBe(false);
        expect(normalized.hideNativeKeyboard).toBe(false);
      });

      /* That every keyboard element's entry carries all of these is no longer a spec but a compile
         error: `KeyboardDefaultsAreComplete` in element-registry.ts derives who needs them from the
         interfaces and checks the table for them. The load path no longer reaches the `false` fallback
         of `generateKeyInputProps` at all -- the normalizer fills these like any other own property,
         and has no list of keyboard types left to forget one (#1224, #1228). */

      /* The registry is not the only way in: the cloze editor extension builds its child field as
         `new TextFieldSimpleElement()`, bypassing the normalizer, so a blueprint that does not name
         the three leaves the class field of TextInputElement deciding. It has to agree with the
         registry - the two drifting apart is what #1235 was. */
      it.each(KEYBOARD_ON_CONSTRUCTORS)(
        'should carry the same values in the class field of %s, for a blueprint without them',
        (_type, create) => {
          const element = create();

          expect(element.showSoftwareKeyboard).toBe(true);
          expect(element.addInputAssistanceToKeyboard).toBe(true);
          expect(element.hideNativeKeyboard).toBe(true);
        }
      );
    });

    describe('the element values the move to the table changed (#1235)', () => {
      const at = (element: object, path: string): unknown => path.split('.')
        .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], element);

      /* What the element carried in the 2.12 release and lost when the defaults moved into the flat
         table. Each replacement had a source and none of them was a choice: a generic fallback for
         audio's width, `undefined || 100` in the radio model, and for slider a 5 that arrived in the
         same commit as the string booleans of #1139 and renders as `line-height: 5%`. */
      const RESTORED: [UIElementType, string, unknown][] = [
        ['slider', 'styling.lineHeight', 135],
        ['radio', 'styling.lineHeight', 135],
        ['radio', 'dimensions.height', 100],
        ['audio', 'dimensions.width', 250],
        ['drop-list', 'permanentPlaceholdersCC', true],
        ['text-field-simple', 'styling.lineHeight', 100],
        ['text-field-simple', 'dimensions.width', 150],
        ['text-field-simple', 'dimensions.isWidthFixed', true]
      ];

      /* Values that moved too and are deliberately NOT the 2.12 ones. Only the first was picked in
         a commit of its own (b496db38 "Fix styles of cloze children"); the other two come from the
         same transcription as the rows above, where 2.12 had no element value at all but the
         generic 180 - and a wider radio group and a taller image group are what 3.0 wants. They are
         asserted so that the next comparison against 2.12 does not "restore" them by mistake. */
      const KEPT: [UIElementType, string, unknown][] = [
        ['text-field-simple', 'styling.backgroundColor', '#f1f1f1'],
        ['radio', 'dimensions.width', 215],
        ['radio-group-images', 'dimensions.height', 200]
      ];

      it.each([...RESTORED, ...KEPT])('should create %s with %s = %s', (type, path, value) => {
        expect(at(ElementFactory.createElement({ type }), path)).toBe(value);
      });

      /* The other way in, and the one #1235 was about: the normalizer splits the flat entry into the
         groups when a stored unit does not carry them. Every assertion above goes through the
         constructors, which would stay green if that split lost a key again (#1187). */
      it('should split the restored dimensions into the group on the load path', () => {
        const normalized = ModelNormalizer.normalizeElement({ type: 'text-field-simple', id: 'tfs_3' });

        expect(normalized.dimensions).toMatchObject({ width: 150, isWidthFixed: true });
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

    /* #960: the option control's vertical alignment. 'auto' is the behaviour every stored unit has
       shown since 2.11, so a unit written before this property existed has to come out of the load
       with exactly that -- which is what makes the migration step unnecessary. */
    describe('verticalButtonAlignment (#960)', () => {
      it.each<[UIElementType]>([['radio'], ['checkbox']])(
        'should default %s to alignment on the first line',
        type => {
          expect(ELEMENT_DEFAULTS[type as 'radio' | 'checkbox'].verticalButtonAlignment).toBe('auto');
          expect(ElementFactory.createElement({ type }).verticalButtonAlignment).toBe('auto');
        }
      );

      it('should fill it into a unit stored without it', () => {
        expect(ModelNormalizer.normalizeElement({ type: 'radio', id: 'r1' }).verticalButtonAlignment)
          .toBe('auto');
      });

      it('should keep a stored choice', () => {
        const normalized = ModelNormalizer
          .normalizeElement({ type: 'checkbox', id: 'cb1', verticalButtonAlignment: 'center' });

        expect(normalized.verticalButtonAlignment).toBe('center');
      });

      /* The option table has carried the property since 3.2.0 and centres its rows -- unchanged by
         the two entries above, which the shared model level could have dragged along. */
      it('should leave the option table row centred', () => {
        expect(ELEMENT_DEFAULTS['likert-row'].verticalButtonAlignment).toBe('center');
      });
    });
  });

  /* #1184: no element may hold an object that ELEMENT_DEFAULTS or GLOBAL_DEFAULTS owns, or an in-place
     write reaches the table and moves the value for every element of that type. The fix is in
     generatePositionProps (the four margins were forwarded by reference); these sweeps guard the
     invariant rather than that one line, by comparing IDENTITY over all types -- so a new
     object-valued default, or a new generator that forwards one, is caught without editing them.

     What they do NOT cover, so the heading is not read as more than it is: sharing that does not
     originate in the tables. The base constructor merges the INCOMING properties object shallowly. The
     editor's position write path was the other case of that kind and copies per element since #1193.

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
