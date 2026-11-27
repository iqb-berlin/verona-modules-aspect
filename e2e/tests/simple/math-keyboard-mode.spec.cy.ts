import {
  KeycapDefinition, keycapWith, pressKeycap, VISIBLE_KEYBOARD_LAYER as VISIBLE_LAYER
} from '../util';

/* In a math field whose input mode can be switched, the formula keyboard opens on the tab of the mode
   (#1692), and turns to it when the switch is pressed: formula mode on the first tab of formulas, text mode
   on the letters. Both modes offer every selected layout, so that a formula can still take its x from the
   letters, and what is typed in text mode leaves the field in text mode. */

const SWITCHABLE = '[data-element-id="math-field_mode"]';
const FIXED = '[data-element-id="math-field_fixed"]';
const MULTILINE = '[data-element-id="math-field_multiline"]';
const LINES = '[data-element-id="math-field_lines"]';
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
    openKeyboard(MULTILINE);
    switchMode('Text', MULTILINE);
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    pressKey('Enter', MULTILINE);
    pressKeycap(keycapWith('the b of the letters', definition => definition.label === 'b'));
    pressKeycap(keycapWith('the backspace of the letters', BACKSPACE));
    expectTextMode('\\displaylines{\\text{a}\\\\ }', MULTILINE);
    pressKey('ArrowUp', MULTILINE);
    pressKey('ArrowDown', MULTILINE);
    expectTextMode('\\displaylines{\\text{a}\\\\ }', MULTILINE);
  });

  // MathLive keeps the lines, empty, when all of the text is deleted at once.
  it('goes back to its height when text on several lines is selected and deleted', () => {
    openKeyboard(MULTILINE);
    switchMode('Text', MULTILINE);
    cy.get(`${MULTILINE} math-field`).then($field => {
      cy.wrap($field[0].getBoundingClientRect().height).as('emptyHeight');
    });
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    pressKey('Enter', MULTILINE);
    pressKeycap(keycapWith('the b of the letters', definition => definition.label === 'b'));
    cy.get<number>('@emptyHeight').then(emptyHeight => {
      cy.get(`${MULTILINE} math-field`).should($field => {
        expect($field[0].getBoundingClientRect().height).to.be.greaterThan(emptyHeight);
      });
    });
    // MathLive's own command: its shortcut differs between macOS and the other systems.
    cy.get(`${MULTILINE} math-field`).then($field => {
      ($field[0] as HTMLElement & { executeCommand(command: string): boolean }).executeCommand('selectAll');
    });
    pressKeycap(keycapWith('the backspace of the letters', BACKSPACE));
    expectTextMode('', MULTILINE);
    cy.get<number>('@emptyHeight').then(emptyHeight => {
      cy.get(`${MULTILINE} math-field`).should($field => {
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

/* A multi-line math field has an Enter key on the letters in text mode, which starts a new line as Return
   does (#1696). In formula mode, and in a single-line field, the letters have none. The Enter key is the
   only key of the formula keyboard that is shown in text mode only (`if-text-mode`). */
describe('The Enter key of a multi-line math field (#1696)', () => {
  const ENTER_KEY = `${VISIBLE_LAYER} .if-text-mode`;

  beforeEach('opens the unit', () => {
    cy.openPlayer();
    cy.loadUnit('math-keyboard-mode.json');
  });

  it('starts a new line in text mode, and the field stays in text mode', () => {
    openKeyboard(MULTILINE);
    switchMode('Text', MULTILINE);
    expectTabs(['123', 'abc'], 'abc');
    cy.get(ENTER_KEY).should('be.visible');
    pressKeycap(keycapWith('the a of the letters', definition => definition.label === 'a'));
    pressKeycap(keycapWith('the Enter key', definition => definition.command === 'performWithFeedback(commit)'));
    pressKeycap(keycapWith('the b of the letters', definition => definition.label === 'b'));
    cy.get(`${MULTILINE} math-field`).should($field => {
      const field = $field[0] as HTMLElement & { mode: string; getValue(): string };
      expect(field.getValue()).to.equal('\\displaylines{\\text{a}\\\\ \\text{b}}');
      expect(field.mode).to.equal('text');
    });
  });

  // Hidden rather than left out, so that the keys beside it stay where they are at a change of mode.
  it('is hidden in formula mode, and keeps its place', () => {
    openKeyboard(MULTILINE);
    cy.get(`${VISIBLE_LAYER} [data-layer]`).contains('abc').trigger('pointerdown', { button: 0 });
    expectTabs(['123', 'abc'], 'abc');
    cy.get(ENTER_KEY).should('not.be.visible')
      .and($key => {
        expect($key[0].getBoundingClientRect().width).to.be.greaterThan(0);
      });
  });

  // MathLive marks formula and text mode on the keyboard, and no mode at all for LaTeX, opened by Escape.
  it('is hidden in LaTeX mode', () => {
    openKeyboard(MULTILINE);
    pressKey('Escape', MULTILINE);
    cy.get(`${MULTILINE} math-field`).should($field => {
      expect(($field[0] as HTMLElement & { mode: string }).mode).to.equal('latex');
    });
    cy.get(`${VISIBLE_LAYER} [data-layer]`).contains('abc').trigger('pointerdown', { button: 0 });
    expectTabs(['123', 'abc'], 'abc');
    cy.get(ENTER_KEY).should('not.be.visible');
  });

  it('is not on the letters of a single-line field', () => {
    openKeyboard(SWITCHABLE);
    switchMode('Text');
    expectTabs(ALL_TABS, 'abc');
    cy.get(ENTER_KEY).should('not.exist');
  });
});

/* In formula mode, the arrow keys keep the cursor in its line in a multi-line field (#1696); the arrows of
   the formula keyboard fire no keydown. */
describe('The arrows in formula mode in a multi-line math field (#1696)', () => {
  beforeEach('opens the unit', () => {
    cy.openPlayer();
    cy.loadUnit('math-keyboard-mode.json');
  });

  // The field holds a formula and, below it, a line of text, as made in text mode.
  it('leaves the cursor in its line in formula mode when the → of the formulas is pressed at its end', () => {
    openKeyboard(LINES);
    cy.get(`${LINES} math-field`).then($field => {
      const field = $field[0] as HTMLElement & { executeCommand(command: string): boolean };
      field.executeCommand('moveToMathfieldStart');
      ['x', '+', '1'].forEach(() => field.executeCommand('moveToNextChar'));
    });
    // The click that opened the keyboard may have put the cursor into the text.
    cy.get(`${VISIBLE_LAYER} [data-layer]`).contains('123').trigger('pointerdown', { button: 0 });
    pressKeycap(keycapWith('the → key', definition => definition.command === 'performWithFeedback(moveToNextChar)'));
    pressKeycap(keycapWith('the 2 of the formulas', definition => definition.latex === '2'));
    cy.get(`${LINES} math-field`).should($field => {
      expect(($field[0] as HTMLElement & { getValue(): string }).getValue())
        .to.equal('\\displaylines{x+12\\\\ \\text{ab}}');
    });
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
function switchMode(label: 'Formel' | 'Text', field = SWITCHABLE): void {
  cy.contains(`${field} mat-button-toggle`, label).find('button').click({ force: true });
}

/**
 * A key of a physical keyboard, pressed in the given field. MathLive listens on its own input element in the
 * shadow root; the event leaves it, as a real one does, for the listeners on the field.
 */
function pressKey(key: string, field: string): void {
  cy.get(`${field} math-field`).shadow().find('[part=keyboard-sink]').then($sink => {
    const win = $sink[0].ownerDocument.defaultView as Window & typeof globalThis;
    $sink[0].dispatchEvent(new win.KeyboardEvent('keydown', {
      key, code: key, bubbles: true, composed: true
    }));
  });
}

/** The value of the given field, in text mode, with the switch showing it. */
function expectTextMode(value: string, field: string): void {
  cy.get(`${field} math-field`).should($field => {
    const mathField = $field[0] as HTMLElement & { mode: string; getValue(): string };
    expect(mathField.getValue()).to.equal(value);
    expect(mathField.mode).to.equal('text');
  });
  cy.get(`${field} mat-button-toggle.mat-button-toggle-checked`).should('contain', 'Text');
}

/** The tabs of the open keyboard, and which of them is open. */
function expectTabs(labels: string[], open: string): void {
  cy.get(TABS).should($tabs => {
    expect([...$tabs].map(tab => tab.textContent?.trim())).to.deep.equal(labels);
    expect($tabs.filter('.selected').text().trim()).to.equal(open);
  });
}
