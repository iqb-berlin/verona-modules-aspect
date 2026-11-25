import { VirtualKeyboardKeycap } from 'mathlive';
import { FORMULA_KEYBOARD_PRESETS } from './formula-keyboard-presets.config';

/** The letter keys of the Greek layout: every keycap written as an object that inserts something. */
const greekLetterKeys = (): Partial<VirtualKeyboardKeycap>[] => {
  const layout = FORMULA_KEYBOARD_PRESETS.iqbGreek as unknown as { rows: unknown[][] };
  return layout.rows.flat()
    .filter((keycap): keycap is Partial<VirtualKeyboardKeycap> => typeof keycap === 'object' && keycap !== null)
    .filter(keycap => !!keycap.insert);
};

const shiftOf = (keycap: Partial<VirtualKeyboardKeycap>): Partial<VirtualKeyboardKeycap> => (
  keycap.shift as Partial<VirtualKeyboardKeycap>
);

/** What the label of the shifted key shows: the capital letter, and the name written beneath it. */
const renderedCapital = (keycap: Partial<VirtualKeyboardKeycap>): { glyph?: string; name?: string } => {
  const label = document.createElement('div');
  label.innerHTML = shiftOf(keycap).label ?? '';
  const name = label.querySelector('aside.greek-capital-name');
  name?.remove();
  return { glyph: label.textContent?.replace(/\s/g, ''), name: name?.textContent ?? undefined };
};

/**
 * Every lowercase key with a shift layer: what it inserts, what the shifted key inserts, the name it shows
 * and the letter its label renders. Written out rather than derived from the layout, so any change to a
 * key has to be a deliberate change of this table.
 */
const CAPITALS: Record<string, { insert: string; name: string; glyph: string }> = {
  '\\varphi': { insert: '\\Phi', name: 'Phi', glyph: 'Φ' },
  '\\varsigma': { insert: '\\Sigma', name: 'Sigma', glyph: 'Σ' },
  '\\epsilon': { insert: '\\char"395', name: 'Epsilon', glyph: 'Ε' },
  '\\rho': { insert: '\\char"3A1', name: 'Rho', glyph: 'Ρ' },
  '\\tau': { insert: '\\char"3A4', name: 'Tau', glyph: 'Τ' },
  '\\upsilon': { insert: '\\Upsilon', name: 'Upsilon', glyph: 'Υ' },
  '\\theta': { insert: '\\Theta', name: 'Theta', glyph: 'Θ' },
  '\\iota': { insert: '\\char"399', name: 'Iota', glyph: 'Ι' },
  '\\omicron': { insert: '\\char"39F', name: 'Omicron', glyph: 'Ο' },
  '\\pi': { insert: '\\Pi', name: 'Pi', glyph: 'Π' },
  '\\alpha': { insert: '\\char"391', name: 'Alpha', glyph: 'Α' },
  '\\sigma': { insert: '\\Sigma', name: 'Sigma', glyph: 'Σ' },
  '\\delta': { insert: '\\Delta', name: 'Delta', glyph: 'Δ' },
  '\\phi': { insert: '\\Phi', name: 'Phi', glyph: 'Φ' },
  '\\gamma': { insert: '\\Gamma', name: 'Gamma', glyph: 'Γ' },
  '\\eta': { insert: '\\char"397', name: 'Eta', glyph: 'Η' },
  '\\xi': { insert: '\\Xi', name: 'Xi', glyph: 'Ξ' },
  '\\kappa': { insert: '\\char"39A', name: 'Kappa', glyph: 'Κ' },
  '\\lambda': { insert: '\\Lambda', name: 'Lambda', glyph: 'Λ' },
  '\\zeta': { insert: '\\char"396', name: 'Zeta', glyph: 'Ζ' },
  '\\chi': { insert: '\\char"3A7', name: 'Chi', glyph: 'Χ' },
  '\\psi': { insert: '\\Psi', name: 'Psi', glyph: 'Ψ' },
  '\\omega': { insert: '\\Omega', name: 'Omega', glyph: 'Ω' },
  '\\beta': { insert: '\\char"392', name: 'Beta', glyph: 'Β' },
  '\\nu': { insert: '\\char"39D', name: 'Nu', glyph: 'Ν' },
  '\\mu': { insert: '\\char"39C', name: 'Mu', glyph: 'Μ' }
};

describe('FORMULA_KEYBOARD_PRESETS iqbGreek', () => {
  it('labels the psi key as psi and only the zeta key as zeta', () => {
    const asides = Object.fromEntries(greekLetterKeys().map(keycap => [keycap.insert, keycap.aside]));
    expect(asides['\\psi']).toBe('psi');
    expect(Object.keys(asides).filter(insert => asides[insert] === 'zeta')).toEqual(['\\zeta']);
  });

  it('gives exactly the expected keys a shift layer', () => {
    const shifted = greekLetterKeys().filter(keycap => keycap.shift !== undefined).map(keycap => keycap.insert);
    expect(shifted.sort()).toEqual(Object.keys(CAPITALS).sort());
  });

  it('inserts the expected capital letter and shows that letter with its name', () => {
    greekLetterKeys().filter(keycap => keycap.shift !== undefined).forEach(keycap => {
      const expected = CAPITALS[keycap.insert as string];
      const { glyph, name } = renderedCapital(keycap);
      expect(shiftOf(keycap).insert).toBe(expected.insert);
      expect(name).toBe(expected.name);
      expect(glyph).toBe(expected.glyph);
    });
  });

  it('shows a Greek capital, not a Latin look-alike, on every shifted key (#1652)', () => {
    greekLetterKeys().filter(keycap => keycap.shift !== undefined).forEach(keycap => {
      expect(renderedCapital(keycap).glyph, `shift of ${keycap.insert}`).toMatch(/^\p{Script=Greek}$/u);
    });
  });
});

/** The parts of a keycap these tests read; the rest of mathlive's keycap type does not matter here. */
interface KeycapFields {
  latex?: string;
  insert?: string;
  command?: string;
  shift?: string | KeycapFields;
}

/** A keycap written as a string (`'\\cup'`) as the object mathlive makes of it. */
const asKeycap = (keycap: unknown): KeycapFields => (
  typeof keycap === 'string' ? { latex: keycap } : keycap as KeycapFields);

/** All keycaps of a layout, from its rows or from the rows of its layers, written as objects. */
const keycapsOf = (layoutName: string): KeycapFields[] => {
  const layout = FORMULA_KEYBOARD_PRESETS[layoutName] as unknown as {
    rows?: unknown[][];
    layers?: { rows?: unknown[][] }[];
  };
  const rows = layout.rows ?? (layout.layers ?? []).flatMap(layer => layer.rows ?? []);
  return rows.flat().map(asKeycap);
};

/** A keycap and its shift layer as two keycaps; mathlive treats an object shift layer as a keycap of its own. */
const withShift = (keycap: KeycapFields): KeycapFields[] => {
  if (keycap.shift === undefined) return [keycap];
  return [keycap, typeof keycap.shift === 'string' ? { latex: keycap.shift } : keycap.shift];
};

/* shownBy and insertedLatex read the fields in mathlive's order and with its `||`, so an empty string
   falls through as it does there (renderKeycap and executeKeycapCommand). */
/** The LaTeX one layer of a keycap shows, without its shift layer. */
const shownBy = (layer: KeycapFields): string | undefined => layer.latex || layer.insert;

/** Every LaTeX fragment a keycap shows, its own and that of its shift layer. */
const shownLatex = (keycap: KeycapFields): string[] => withShift(keycap)
  .map(shownBy)
  .filter((latex): latex is string => !!latex);

/** Every LaTeX fragment a keycap inserts when pressed, with and without shift. */
const insertedLatex = (keycap: KeycapFields): string[] => withShift(keycap)
  .map(layer => layer.insert || layer.latex)
  .filter((latex): latex is string => !!latex);

/** Whether every brace of the LaTeX is closed, and none closes before it opened. `\{` and `\}` are
    characters, not braces. */
const hasBalancedBraces = (latex: string): boolean => {
  let depth = 0;
  return latex.replace(/\\[{}]/g, '').split('').every(character => {
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    return depth >= 0;
  }) && depth === 0;
};

describe('FORMULA_KEYBOARD_PRESETS', () => {
  const layoutNames = Object.keys(FORMULA_KEYBOARD_PRESETS);

  describe('key labels (#1011)', () => {
    it.each(layoutNames)('%s shows no key with a filled box', layoutName => {
      // mathlive draws #@ on a key as a filled blue square, #? and #0 as an empty box
      const filled = keycapsOf(layoutName).flatMap(shownLatex).filter(latex => latex.includes('#@'));
      expect(filled).toEqual([]);
    });

    // Only the layouts with such keys: in the others there would be nothing to compare
    it.each(['iqbPhysics', 'iqbNumeric', 'iqbSymbols'])(
      '%s labels each key that takes the preceding term as what it inserts',
      layoutName => {
        // the label is the inserted template with an empty box in place of the preceding term
        const pairs = keycapsOf(layoutName).flatMap(withShift)
          .filter(layer => layer.insert?.includes('#@') && layer.latex !== undefined)
          .map(layer => [layer.latex, layer.insert?.replace(/#@/g, '#?')]);
        expect(pairs.length, 'keys that take the preceding term').toBeGreaterThan(0);
        pairs.forEach(([label, expected]) => expect(label).toBe(expected));
      }
    );

    /* A stray closing brace stood on the power key and on the nth root (#1011): mathlive reports
       unbalanced-braces and drops it, so nothing visible gives it away. */
    it.each(layoutNames)('%s shows and inserts LaTeX whose braces are balanced', layoutName => {
      const unbalanced = keycapsOf(layoutName)
        .flatMap(keycap => [...shownLatex(keycap), ...insertedLatex(keycap)])
        .filter(latex => !hasBalancedBraces(latex));
      expect(unbalanced).toEqual([]);
    });
  });

  describe('iqbSymbols arrangement (#1011)', () => {
    const rows = (FORMULA_KEYBOARD_PRESETS.iqbSymbols as unknown as { rows: unknown[][] }).rows;

    /** Width of a keycap in key widths, as mathlive lays it out; `[separator-5]` is half a key. Any other
        bracketed shortcut (`[shift]`, `[left]`, ...) has a width of mathlive's own and counts as NaN, so the
        width test fails instead of miscounting. */
    const widthOf = (keycap: unknown): number => {
      if (typeof keycap === 'string') {
        const separator = /^\[separator-(\d+)\]$/.exec(keycap);
        if (separator) return Number(separator[1]) / 10;
        return keycap.startsWith('[') ? NaN : 1;
      }
      return (keycap as { width?: number }).width ?? 1;
    };

    it('keeps every row ten keys wide', () => {
      expect(rows.map(row => row.reduce((width: number, keycap) => width + widthOf(keycap), 0)))
        .toEqual([10, 10, 10, 10]);
    });
  });

  /* MathLive types a key without `latex`, `insert` or `command` as if typed on a physical keyboard, in
     the mode the field is in; any of the three inserts as a formula (executeKeycapCommand), as does a
     shift written as a string. A full stop typed on the letters in text mode put the field into formula
     mode that way (#1692). */
  it('lets the letters type their punctuation in the mode of the field', () => {
    const punctuation = keycapsOf('iqbText')
      .filter(keycap => [',', '.'].includes((keycap as { label?: string }).label ?? ''))
      .flatMap(withShift)
      .map(layer => ({
        label: (layer as { label?: string }).label,
        insertsAsFormula: layer.latex !== undefined || layer.insert !== undefined || layer.command !== undefined
      }));
    expect(punctuation).toEqual([
      { label: ',', insertsAsFormula: false },
      { label: ';', insertsAsFormula: false },
      { label: '.', insertsAsFormula: false },
      { label: ':', insertsAsFormula: false }
    ]);
  });
});
