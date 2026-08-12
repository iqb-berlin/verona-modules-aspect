import { ElementFactory } from 'common/utils/element-factory';
import { AbstractIDService } from 'common/models/id-interfaces';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { UIElement } from 'common/models/elements/element';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

describe('UIElement setProperty alias validation', () => {
  let element: UIElement;

  const idServiceStub: AbstractIDService = {
    getAndRegisterNewID: () => 'text_1',
    register: () => {},
    unregister: () => {},
    isAliasAvailable: () => true,
    changeAlias: () => {}
  };

  beforeEach(() => {
    element = ElementFactory.createElement({
      type: 'text',
      id: 'text_1',
      alias: 'text_1'
    } as unknown as UIElementProperties);
    element.idService = idServiceStub;
  });

  it('should accept aliases with letters, digits, underscore and dash', () => {
    element.setProperty('alias', 'var_1-neu');
    expect(element.alias).toBe('var_1-neu');
  });

  it('should reject aliases with umlauts', () => {
    expect(() => element.setProperty('alias', 'März')).toThrowError(/unerlaubte Zeichen/);
    expect(() => element.setProperty('alias', 'Lösung1')).toThrowError(/unerlaubte Zeichen/);
  });

  it('should reject aliases with trailing whitespace', () => {
    expect(() => element.setProperty('alias', 'weiter ')).toThrowError(/Leerzeichen/);
  });

  /* The Verona contract sets no maximum length, therefore neither does Aspect (#1129). */
  it('should accept aliases longer than 20 characters', () => {
    const longAlias = 'a'.repeat(21);
    element.setProperty('alias', longAlias);
    expect(element.alias).toBe(longAlias);
  });
});

/* Which styling keys an element ends up with is decided by the group its class builds, and by nothing
   else (#1187). Before, ModelNormalizer rebuilt the group from four hand-kept lists and the
   constructors deferred to the result -- so frame, audio and video, whose declared styling has no font
   member at all, carried six of them, and the panel offered sliders that render nothing. */
describe('the styling group an element keeps', () => {
  const FONT_KEYS = ['bold', 'italic', 'underline', 'font', 'fontColor', 'fontSize'];

  /* Realistic payloads for the compound types; a bare `{ type }` never reaches their children. */
  const stylingOf = (type: UIElementType, styling?: Record<string, unknown>): Record<string, unknown> => {
    const blueprint: Record<string, unknown> = { type, id: `${type}_1`, alias: `${type}_1` };
    if (type === 'likert') blueprint.rows = [];
    if (styling) blueprint.styling = styling;
    return (ElementFactory.createElement(blueprint as unknown as UIElementProperties)
      .styling ?? {}) as Record<string, unknown>;
  };

  it('should give frame, audio and video no font styling', () => {
    (['frame', 'audio', 'video'] as UIElementType[]).forEach(type => {
      expect(Object.keys(stylingOf(type)).filter(key => FONT_KEYS.includes(key))).toEqual([]);
    });
  });

  it('should keep the border group of a frame and the background of a video', () => {
    expect(Object.keys(stylingOf('frame')).sort())
      .toEqual(['backgroundColor', 'borderColor', 'borderRadius', 'borderStyle', 'borderWidth']);
    expect(stylingOf('video')).toEqual({ backgroundColor: ELEMENT_DEFAULTS.video.backgroundColor });
  });

  it('should still give a text element its font styling', () => {
    expect(Object.keys(stylingOf('text'))).toEqual(expect.arrayContaining(FONT_KEYS));
  });

  it('should give the border group to the element types that declare it, and to no others', () => {
    expect(stylingOf('button').borderWidth).toBeDefined();
    expect(stylingOf('table').borderWidth).toBeDefined();
    expect(stylingOf('text').borderWidth).toBeUndefined();
    expect(stylingOf('likert').borderWidth).toBeUndefined();
  });

  /* The VALUES of the extra styling defaults, which no type checks: #1177 turned a plausible-looking
     100 into the intended one for radio, and the spell-correct entry was added for the same reason. */
  it('should lift the extra styling defaults of an element into its group', () => {
    expect(stylingOf('radio').lineHeight).toBe(100);
    expect(stylingOf('spell-correct').lineHeight).toBe(135);
    expect(stylingOf('toggle-button').selectionColor).toBe('#c9e0e0');
    expect(stylingOf('drop-list').itemBackgroundColor).toBe('#c9e0e0');
    expect(stylingOf('math-table').helperRowColor).toBe('transparent');
  });

  /* The other half of the contract: a key the element declares survives a load with its stored value,
     which is what the catalogue in ModelNormalizer was for (#1177, #1185). */
  it('should keep stored values for the keys an element declares', () => {
    expect(stylingOf('likert', { lineColoring: false, lineHeight: 200 }))
      .toEqual(expect.objectContaining({ lineColoring: false, lineHeight: 200 }));
    expect(stylingOf('toggle-button', { selectionColor: '#123456' }).selectionColor).toBe('#123456');
    expect(stylingOf('spell-correct', { lineHeight: 210 }).lineHeight).toBe(210);
  });

  /* The three cases above name three of the 25 merge sites, and a class that forgets its merge loses
     every stored styling value it has -- silently, exactly the failure class the four lists in
     ModelNormalizer produced. So this sweep asks the question of every key of every type: store a
     value that differs from the element's own and see whether it survives. It also covers element
     classes that do not exist yet (#1187 review). */
  it('should keep a stored value for every key of every element group', () => {
    const differing = (value: unknown): unknown => {
      if (typeof value === 'boolean') return !value;
      if (typeof value === 'number') return value + 7;
      if (typeof value === 'string') return `${value}-stored`;
      return value;
    };

    const lost = (Object.keys(ELEMENT_DEFAULTS) as UIElementType[]).flatMap(type => {
      const stored = Object.fromEntries(
        Object.entries(stylingOf(type)).map(([key, value]) => [key, differing(value)])
      );
      const merged = stylingOf(type, stored);
      return Object.keys(stored).filter(key => merged[key] !== stored[key]).map(key => `${type}.${key}`);
    });

    expect(lost).toEqual([]);
  });

  /* A sweep rather than three cases: storing every styling key there is must widen no element's group.
     This is the direction the type machinery structurally cannot see -- it checks that declared keys
     survive, not that undeclared ones stay out (#1187). */
  it('should widen no element group, whatever a stored unit carries', () => {
    const everyStylingKey = {
      backgroundColor: 'red',
      fontColor: 'blue',
      font: 'Arial',
      fontSize: 99,
      bold: true,
      italic: true,
      underline: true,
      borderWidth: 9,
      borderColor: 'green',
      borderStyle: 'dotted',
      borderRadius: 9,
      lineHeight: 199,
      itemBackgroundColor: 'pink',
      lineColoring: true,
      lineColoringColor: 'grey',
      firstLineColoring: true,
      firstLineColoringColor: 'grey',
      selectionColor: 'grey',
      helperRowColor: 'grey',
      keyTheModelNeverKnew: 'x'
    };
    const widened = (Object.keys(ELEMENT_DEFAULTS) as UIElementType[])
      .filter(type => Object.keys(stylingOf(type, everyStylingKey)).length !== Object.keys(stylingOf(type)).length);

    expect(widened).toEqual([]);
  });
});
