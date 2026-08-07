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
});
