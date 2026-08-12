import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';

describe('PropertyGroupGenerators', () => {
  /* The generators are usually handed an ELEMENT_DEFAULTS entry -- by ModelNormalizer and by 27 class
     fields across the element models. Whatever they return therefore has to be the element's own:
     returning an incoming object hands the registry's copy to every element built from that entry
     (#1184). Only the four margins are object-valued; every other member of every group is a primitive
     or null, so this is the one generator that can leak. */
  describe('generatePositionProps', () => {
    it('should copy the margins instead of returning the ones it was given', () => {
      const position = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.text);

      expect(position.marginBottom).toEqual(ELEMENT_DEFAULTS.text.marginBottom);
      expect(position.marginBottom).not.toBe(ELEMENT_DEFAULTS.text.marginBottom);
    });

    /* Acted out rather than reasoned from identity, because this is the damage the copy prevents. The
       identity is asserted BEFORE the write: on a regression the returned margin IS the registry's, so
       writing first would leave the table at 999 and every later test would fail for the wrong reason. */
    it('should leave the entry untouched when a returned margin is edited', () => {
      const before = ELEMENT_DEFAULTS.text.marginBottom.value;
      const position = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.text);
      expect(position.marginBottom).not.toBe(ELEMENT_DEFAULTS.text.marginBottom);

      position.marginBottom.value = before + 989;

      expect(ELEMENT_DEFAULTS.text.marginBottom.value).toBe(before);
    });

    /* The fallback for an entry without margins was always a fresh literal; pinned so the two branches
       cannot drift apart. */
    it('should default a missing margin to a fresh zero measurement', () => {
      const first = PropertyGroupGenerators.generatePositionProps({});
      const second = PropertyGroupGenerators.generatePositionProps({});

      expect(first.marginTop).toEqual({ value: 0, unit: 'px' });
      expect(first.marginTop).not.toBe(second.marginTop);
    });
  });

  /* This is where the set of styling keys an element keeps is decided (#1187): the group the class
     built for itself is the whitelist, and the compiler checks it against the element's declared
     styling type. Both directions matter -- a declared key must not be lost on load (#1177, #1185),
     and a key the model no longer knows must not ride along into a saved unit. */
  describe('mergeStyling', () => {
    const own = { backgroundColor: 'white', bold: false, fontSize: 20 };

    it('should take a stored value for a key the element declares', () => {
      const merged = PropertyGroupGenerators.mergeStyling(own, { backgroundColor: 'red' });

      expect(merged.backgroundColor).toBe('red');
    });

    it('should drop a stored key the element does not declare', () => {
      const merged = PropertyGroupGenerators.mergeStyling(own, { lineHeight: 135 });

      expect(Object.keys(merged).sort()).toEqual(['backgroundColor', 'bold', 'fontSize']);
    });

    /* `false` and `0` are styling values, not absences: an `||` fallback here would silently restore
       the default for every switch a user turned off. */
    it('should keep a stored false over the element default', () => {
      const merged = PropertyGroupGenerators.mergeStyling({ bold: true }, { bold: false });

      expect(merged.bold).toBe(false);
    });

    it('should fall back to the element value for a key the stored group leaves undefined', () => {
      const merged = PropertyGroupGenerators.mergeStyling(own, { backgroundColor: undefined });

      expect(merged.backgroundColor).toBe('white');
    });

    /* A blueprint without styling is what the eight replacing constructors used to turn into an empty
       group: `{ ...element.styling }` of undefined is `{}`, so every default was lost. Invisible in the
       apps, because ElementFactory normalizes first, and a trap for every other caller. */
    it('should return the element group unchanged when nothing is stored', () => {
      const merged = PropertyGroupGenerators.mergeStyling(own, undefined);

      expect(merged).toEqual(own);
      expect(merged).not.toBe(own);
    });
  });
});
