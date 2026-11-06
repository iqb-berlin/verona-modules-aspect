import { VirtualKeyboardKeycap } from '@iqb/mathlive';
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

/**
 * Every lowercase key with a shift layer: what it inserts, what the shifted key inserts, the name it shows
 * and the letter its label renders. Written out rather than derived from the layout, so any change to a
 * key has to be a deliberate change of this table. The table records what the keys do today, including
 * the two rows marked below as wrong.
 */
const CAPITALS: Record<string, { insert: string; name: string; glyph: string }> = {
  '\\varphi': { insert: '\\Phi', name: 'Phi', glyph: 'Φ' },
  '\\varsigma': { insert: '\\Sigma', name: 'Sigma', glyph: 'Σ' },
  /* U+0190 is the Latin open E, not Greek Ε (U+0395); this row changes when that is fixed. */
  '\\epsilon': { insert: '\\char"0190', name: 'Epsilon', glyph: 'Ɛ' },
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
  /* MathLive renders \\Kappa as the Latin K, not Greek Κ (U+039A); this row changes when that is fixed. */
  '\\kappa': { insert: '\\Kappa', name: 'Kappa', glyph: 'K' },
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
      const shift = shiftOf(keycap);
      const label = document.createElement('div');
      label.innerHTML = shift.label ?? '';
      const name = label.querySelector('aside.greek-capital-name');
      expect(shift.insert).toBe(expected.insert);
      expect(name?.textContent).toBe(expected.name);
      name?.remove();
      expect(label.textContent?.replace(/\s/g, '')).toBe(expected.glyph);
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
// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
const shownBy = (layer: KeycapFields): string | undefined => layer.latex || layer.insert;

/** Every LaTeX fragment a keycap shows, its own and that of its shift layer. */
const shownLatex = (keycap: KeycapFields): string[] => withShift(keycap)
  .map(shownBy)
  .filter((latex): latex is string => !!latex);

/** Every LaTeX fragment a keycap inserts when pressed, with and without shift. */
const insertedLatex = (keycap: KeycapFields): string[] => withShift(keycap)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  .map(layer => layer.insert || layer.latex)
  .filter((latex): latex is string => !!latex);

describe('FORMULA_KEYBOARD_PRESETS', () => {
  const layoutNames = Object.keys(FORMULA_KEYBOARD_PRESETS);

  describe('key labels (#1011)', () => {
    it.each(layoutNames)('%s shows no key with a filled box', layoutName => {
      // mathlive draws #@ on a key as a filled blue square, #? and #0 as an empty box
      const filled = keycapsOf(layoutName).flatMap(shownLatex).filter(latex => latex.includes('#@'));
      expect(filled).toEqual([]);
    });

    it.each(layoutNames)('%s labels each key that takes the preceding term as what it inserts', layoutName => {
      // the label is the inserted template with an empty box in place of the preceding term
      const pairs = keycapsOf(layoutName).flatMap(withShift)
        .filter(layer => layer.insert?.includes('#@') && layer.latex !== undefined)
        .map(layer => [layer.latex, layer.insert?.replace(/#@/g, '#?')]);
      pairs.forEach(([label, expected]) => expect(label).toBe(expected));
    });

    it.each(['iqbPhysics', 'iqbNumeric'])('%s keeps the preceding term for fraction and power', layoutName => {
      const inserted = keycapsOf(layoutName).flatMap(insertedLatex);
      expect(inserted).toEqual(expect.arrayContaining(['\\frac{#@}{#?}', '#@^2', '#@^#?']));
    });

    it('iqbNumeric keeps the preceding term for the degree sign', () => {
      expect(keycapsOf('iqbNumeric').flatMap(insertedLatex)).toContain('#@\\degree');
    });

    it('iqbSymbols still puts what precedes the cursor under the arrow, the bar and the prime', () => {
      const inserted = keycapsOf('iqbSymbols').flatMap(insertedLatex);
      expect(inserted).toEqual(expect.arrayContaining([
        '\\overrightarrow{#@}', '\\overleftarrow{#@}', '\\overline{#@}', '\\underline{#@}',
        '#@^{\\prime}', '#@^{\\doubleprime}'
      ]));
    });
  });

  describe('iqbSymbols characters (#1011)', () => {
    const inserted = (): string[] => keycapsOf('iqbSymbols').flatMap(insertedLatex);

    it.each([
      '\\exists', '\\nexists', '\\forall', '#@^{\\complement}', '\\left\\Vert#0\\right\\Vert',
      '\\mathrm{abs}\\left(#0\\right)', '\\larr', '\\lArr', '\\leftrightarrow', '\\sum', '\\int', '\\iint'
    ])('no longer offers %s', latex => {
      expect(inserted()).not.toContain(latex);
    });

    it.each([
      '\\sphericalangle', '\\approx', '\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{Q}', '\\mathbb{R}', '\\%',
      '\\mapsto', '\\land', '\\lor', '\\lnot', '\\log_{#?}\\left(#0\\right)'
    ])('offers %s', latex => {
      expect(inserted()).toContain(latex);
    });

    it('keeps the definite integral and the equivalence arrow', () => {
      expect(inserted()).toEqual(expect.arrayContaining(['\\int^{{#?}}_{#?}\\!#?\\,\\mathrm{d}x', '\\lrArr']));
    });

    it('is named after characters it offers', () => {
      // the tab was called ∞≠∈ although ≠ is not on it but on the two 123 tabs
      expect(FORMULA_KEYBOARD_PRESETS.iqbSymbols.label).toBe('∞π%');
      expect(inserted()).toEqual(expect.arrayContaining(['\\infty', '\\pi', '\\%']));
    });

    it('shows shift + log as a log with one box for the base and inserts the argument as well', () => {
      // the ticket asks for "log mit Eintrag rechts darunter": the key shows only the base box, while
      // pressing it also adds the brackets for the argument, so that log₂(5) can be written
      const logKey = keycapsOf('iqbSymbols').find(keycap => keycap.latex === '\\log');
      expect(logKey?.shift).toEqual({ latex: '\\log_{#?}', insert: '\\log_{#?}\\left(#0\\right)' });
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

    /** The keycap that starts in a column (1-based) of a row (1-based), written as an object. */
    const keycapAt = (row: number, column: number): KeycapFields | undefined => {
      let start = 1;
      const keycap = rows[row - 1].find(candidate => {
        const startsHere = start === column;
        start += widthOf(candidate);
        return startsHere;
      });
      return keycap === undefined ? undefined : asKeycap(keycap);
    };

    /** What a cell of the grid shows without shift. */
    const shownAt = (row: number, column: number): string | undefined => {
      const keycap = keycapAt(row, column);
      return keycap === undefined ? undefined : shownBy(keycap);
    };

    it('keeps every row ten keys wide', () => {
      expect(rows.map(row => row.reduce((width: number, keycap) => width + widthOf(keycap), 0)))
        .toEqual([10, 10, 10, 10]);
    });

    it('stacks the number sets in the third column, each on a key of its own', () => {
      expect([1, 2, 3, 4].map(row => shownAt(row, 3)))
        .toEqual(['\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{Q}', '\\mathbb{R}']);
      [1, 2, 3, 4].forEach(row => {
        const keycap = keycapAt(row, 3);
        expect(keycap).toBeDefined();
        expect(keycap?.shift).toBeUndefined();
      });
    });

    it('puts the absolute value between infinity and the left arrow', () => {
      expect(shownAt(4, 6)).toBe('\\infty');
      expect(shownAt(4, 7)).toBe('\\left\\vert#0\\right\\vert');
      expect(keycapAt(4, 8)?.command).toBe('performWithFeedback(moveToPreviousChar)');
    });

    it('puts arrow, bar and prime in the seventh column and union, intersection and subset in the eighth', () => {
      expect([1, 2, 3].map(row => shownAt(row, 7)))
        .toEqual(['\\overrightarrow{#?}', '\\overline{#?}', '#?^{\\prime}']);
      expect([1, 2, 3].map(row => shownAt(row, 8))).toEqual(['\\cup', '\\cap', '\\subset']);
    });

    it('puts the definite integral before the percent sign', () => {
      expect([shownAt(2, 9), shownAt(2, 10)]).toEqual(['\\int^{{#?}}_{#?}\\!#?\\,\\mathrm{d}x', '\\%']);
    });
  });
});
