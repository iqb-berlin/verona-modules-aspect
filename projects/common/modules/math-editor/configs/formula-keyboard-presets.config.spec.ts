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
