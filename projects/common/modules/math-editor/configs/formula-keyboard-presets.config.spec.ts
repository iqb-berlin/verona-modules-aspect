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
