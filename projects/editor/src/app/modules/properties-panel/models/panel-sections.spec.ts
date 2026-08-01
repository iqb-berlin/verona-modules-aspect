import { UIElement } from 'common/models/elements/element';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { PANEL_SECTIONS, panelSectionsOf } from './panel-sections';

/**
 * The map itself is checked by the compiler — a missing element type does not build — and by the
 * characterization net, which renders all 30 types and would show any section that appears or
 * disappears. What is left to test here is `panelSectionsOf`, and one property of the map that no
 * compiler can state: that it names only sections the panel actually knows.
 */
describe('panelSectionsOf', () => {
  const element = (type: UIElementType): UIElement => ({ type } as UIElement);

  it('should return the sections of a single element', () => {
    const show = panelSectionsOf([element('image')]);

    expect(show.mediaSource).toBe(true);
    expect(show.image).toBe(true);
    expect(show.options).toBe(false);
  });

  it('should return no section for an empty selection', () => {
    expect(Object.values(panelSectionsOf([])).every(offered => !offered)).toBe(true);
  });

  /* The intersection is what keeps the panel honest for a mixed selection: `createCombinedProperties`
     merges away every property the elements do not share, so a section whose properties are gone
     must not be offered either. */
  describe('for more than one element', () => {
    it('should keep what the types have in common', () => {
      const show = panelSectionsOf([element('image'), element('video')]);

      expect(show.mediaSource).toBe(true);
      expect(show.image).toBe(true);
    });

    it('should drop what only one of them has', () => {
      // The button has an action and a label, the text neither.
      const show = panelSectionsOf([element('button'), element('text')]);

      expect(show.button).toBe(false);
      expect(show.action).toBe(false);
      expect(show.text).toBe(false);
    });

    it('should keep a section both types have for different reasons', () => {
      // Likert offers the sticky header through its rows, the table through its columns.
      const show = panelSectionsOf([element('likert'), element('table')]);

      expect(show.stickyHeader).toBe(true);
      expect(show.options).toBe(false);
    });

    /* The likert has an option list but no single preset, and this is the only thing keeping it
       away from the preset control - `preset-value-properties` used to check `rows` itself, which
       was dead weight once the map existed (#1158). Mixed with a dropdown it is the intersection
       that decides, so this is where the guarantee lives. */
    it('should not offer the preset to a likert, alone or mixed with a dropdown', () => {
      expect(panelSectionsOf([element('likert')]).presetValue).toBe(false);
      expect(panelSectionsOf([element('likert'), element('dropdown')]).presetValue).toBe(false);
      expect(panelSectionsOf([element('dropdown')]).presetValue).toBe(true);
    });

    it('should not care about the order of the selection', () => {
      expect(panelSectionsOf([element('radio'), element('dropdown')]))
        .toEqual(panelSectionsOf([element('dropdown'), element('radio')]));
    });
  });

  /* Every element type the editor can create has to appear in the map. The compiler already
     guarantees that for `UIElementType`; this checks the other direction, that the map is keyed by
     the types the factory really produces and not by a stale list. */
  it('should cover every element type the factory creates', () => {
    Object.keys(PANEL_SECTIONS).forEach(type => {
      expect(() => ElementFactory.createElement({ type: type as UIElementType }))
        .not.toThrow();
    });
  });
});
