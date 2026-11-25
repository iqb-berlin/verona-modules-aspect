import { keycapWith, pressKeycap, VISIBLE_KEYBOARD_LAYER as VISIBLE_LAYER } from '../util';

/* In a math field whose input mode can be switched, the formula keyboard opens on the tab of the mode
   (#1692), and turns to it when the switch is pressed: formula mode on the first tab of formulas, text mode
   on the letters. Both modes offer every selected layout, so that a formula can still take its x from the
   letters, and what is typed in text mode leaves the field in text mode. */

const SWITCHABLE = '[data-element-id="math-field_mode"]';
const FIXED = '[data-element-id="math-field_fixed"]';
const TABS = `${VISIBLE_LAYER} .MLK__toolbar .left > div`;
const ALL_TABS = ['123', '∞π%', 'abc', 'αβγ'];

describe('Formula keyboard and the input mode of a math field (#1692)', () => {
  beforeEach('opens the unit', () => {
    cy.openPlayer();
    cy.loadUnit('math-keyboard-mode.json');
  });

  it('opens on the formulas in formula mode, with every selected layout', () => {
    openKeyboard(SWITCHABLE);
    expectTabs(ALL_TABS, '123');
  });

  it('opens on the letters in text mode, and on the formulas again in formula mode', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    expectTabs(ALL_TABS, 'abc');
    switchMode('Formel');
    expectTabs(ALL_TABS, '123');
  });

  it('stays in text mode and on the Greek letters after a Greek letter typed into the text', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    cy.get(`${VISIBLE_LAYER} [data-layer]`).contains('αβγ').trigger('pointerdown', { button: 0 });
    pressKeycap(keycapWith('the alpha of the Greek letters', definition => definition.insert === '\\alpha'));
    cy.get(`${SWITCHABLE} math-field`).should($field => {
      const field = $field[0] as HTMLElement & { mode: string; getValue(): string };
      expect(field.getValue()).to.contain('\\alpha');
      expect(field.mode).to.equal('text');
    });
    cy.get(`${SWITCHABLE} mat-button-toggle.mat-button-toggle-checked`).should('contain', 'Text');
    expectTabs(ALL_TABS, 'αβγ');
  });

  it('stays in text mode and on the letters after a full stop typed on the letters', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    expectTabs(ALL_TABS, 'abc');
    pressKeycap(keycapWith('the full stop of the letters', definition => definition.label === '.'));
    cy.get(`${SWITCHABLE} math-field`).should($field => {
      const field = $field[0] as HTMLElement & { mode: string; getValue(): string };
      expect(field.getValue()).to.contain('\\text{.}');
      expect(field.mode).to.equal('text');
    });
    expectTabs(ALL_TABS, 'abc');
  });

  // Its first tab is the letters, so that opening on the first preset of formulas would show.
  it('opens on the first tab in a field whose mode cannot be switched', () => {
    openKeyboard(FIXED);
    expectTabs(['abc', 'αβγ'], 'abc');
  });
});

/** Focuses the field; its keyboard opens. */
function openKeyboard(field: string): void {
  cy.get(`${field} math-field`).shadow().find('.ML__content').click();
  cy.get(`${VISIBLE_LAYER} .MLK__keycap`).should('exist');
}

/**
 * Presses the given side of the switch above the field. The press takes the focus from the field, and the
 * keyboard closes. Cypress looks for the element under the pointer once more for the release, and in
 * headless runs that was at times not the switch, so the click never reached it; pressed by hand, it
 * arrives. `force` sends press and release to the button of the switch itself.
 */
function switchMode(label: 'Formel' | 'Text'): void {
  cy.contains(`${SWITCHABLE} mat-button-toggle`, label).find('button').click({ force: true });
}

/** The tabs of the open keyboard, and which of them is open. */
function expectTabs(labels: string[], open: string): void {
  cy.get(TABS).should($tabs => {
    expect([...$tabs].map(tab => tab.textContent?.trim())).to.deep.equal(labels);
    expect($tabs.filter('.selected').text().trim()).to.equal(open);
  });
}
