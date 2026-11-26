import {
  KeycapDefinition, keycapWith, pressKeycap, VISIBLE_KEYBOARD_LAYER as VISIBLE_LAYER
} from '../util';

/* In a math field whose input mode can be switched, the formula keyboard opens on the tab of the mode
   (#1692), and turns to it when the switch is pressed: formula mode on the first tab of formulas, text mode
   on the letters. Both modes offer every selected layout, so that a formula can still take its x from the
   letters, and what is typed in text mode leaves the field in text mode. */

const SWITCHABLE = '[data-element-id="math-field_mode"]';
const FIXED = '[data-element-id="math-field_fixed"]';
const TABS = `${VISIBLE_LAYER} .MLK__toolbar .left > div`;
const ALL_TABS = ['123', '∞π%', 'abc', 'αβγ'];
const BACKSPACE = (definition: KeycapDefinition) => definition.command === 'performWithFeedback(deleteBackward)';

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

  // MathLive puts a field without content into formula mode.
  it('stays in text mode after a letter typed on the letters is deleted again', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    pressKeycap(keycapWith('the backspace of the letters', BACKSPACE));
    cy.get(`${SWITCHABLE} math-field`).should($field => {
      const field = $field[0] as HTMLElement & { mode: string; getValue(): string };
      expect(field.getValue()).to.equal('');
      expect(field.mode).to.equal('text');
    });
    cy.get(`${SWITCHABLE} mat-button-toggle.mat-button-toggle-checked`).should('contain', 'Text');
    pressKeycap(keycapWith('the b of the letters', definition => definition.label === 'b'));
    cy.get(`${SWITCHABLE} math-field`).should($field => {
      expect(($field[0] as HTMLElement & { getValue(): string }).getValue()).to.equal('\\text{b}');
    });
  });

  // MathLive puts the start of a line into formula mode as well.
  it('stays in text mode on an emptied line, and on an empty line the cursor is moved onto', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    pressKey('Enter');
    pressKeycap(keycapWith('the b of the letters', definition => definition.label === 'b'));
    pressKeycap(keycapWith('the backspace of the letters', BACKSPACE));
    expectTextMode('\\displaylines{\\text{a}\\\\ }');
    pressKey('ArrowUp');
    pressKey('ArrowDown');
    expectTextMode('\\displaylines{\\text{a}\\\\ }');
  });

  // MathLive keeps the lines, empty, when all of the text is deleted at once.
  it('goes back to its height when text on several lines is selected and deleted', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    cy.get(`${SWITCHABLE} math-field`).then($field => {
      cy.wrap($field[0].getBoundingClientRect().height).as('emptyHeight');
    });
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    pressKey('Enter');
    pressKeycap(keycapWith('the b of the letters', definition => definition.label === 'b'));
    cy.get<number>('@emptyHeight').then(emptyHeight => {
      cy.get(`${SWITCHABLE} math-field`).should($field => {
        expect($field[0].getBoundingClientRect().height).to.be.greaterThan(emptyHeight);
      });
    });
    // MathLive's own command: its shortcut differs between macOS and the other systems.
    cy.get(`${SWITCHABLE} math-field`).then($field => {
      ($field[0] as HTMLElement & { executeCommand(command: string): boolean }).executeCommand('selectAll');
    });
    pressKeycap(keycapWith('the backspace of the letters', BACKSPACE));
    expectTextMode('');
    cy.get<number>('@emptyHeight').then(emptyHeight => {
      cy.get(`${SWITCHABLE} math-field`).should($field => {
        expect($field[0].getBoundingClientRect().height).to.be.closeTo(emptyHeight, 0.5);
      });
    });
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

/**
 * A key of a physical keyboard, pressed in the switchable field. MathLive listens on its own input element in
 * the shadow root; the event leaves it, as a real one does, for the listeners on the field.
 */
function pressKey(key: string): void {
  cy.get(`${SWITCHABLE} math-field`).shadow().find('[part=keyboard-sink]').then($sink => {
    const win = $sink[0].ownerDocument.defaultView as Window & typeof globalThis;
    $sink[0].dispatchEvent(new win.KeyboardEvent('keydown', {
      key, code: key, bubbles: true, composed: true
    }));
  });
}

/** The value of the switchable field, in text mode, with the switch showing it. */
function expectTextMode(value: string): void {
  cy.get(`${SWITCHABLE} math-field`).should($field => {
    const field = $field[0] as HTMLElement & { mode: string; getValue(): string };
    expect(field.getValue()).to.equal(value);
    expect(field.mode).to.equal('text');
  });
  cy.get(`${SWITCHABLE} mat-button-toggle.mat-button-toggle-checked`).should('contain', 'Text');
}

/** The tabs of the open keyboard, and which of them is open. */
function expectTabs(labels: string[], open: string): void {
  cy.get(TABS).should($tabs => {
    expect([...$tabs].map(tab => tab.textContent?.trim())).to.deep.equal(labels);
    expect($tabs.filter('.selected').text().trim()).to.equal(open);
  });
}
