const AREA = '[data-element-id="text-area-math_keyboard"] .text-area';

/** Presses a key of the player's on-screen keyboard, found by what its button shows. */
function pressKey(label: string): void {
  cy.get('aspect-keyboard button')
    .filter((_, button) => button.textContent?.trim() === label)
    .click({ scrollBehavior: false });
}

/** Two frames: the player sets the caret of an editable text in the next one. */
function waitForCaret(): void {
  cy.window().then(win => new Cypress.Promise<void>(resolve => {
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
  }));
}

/** Top of each line box of the text part, and of the character behind the caret. A caret before a line
    break has no box of its own in Chromium, so the character it stands in front of is measured. */
function measure(area: HTMLElement): { lines: number[]; caret: number | null } {
  const text = area.querySelector('.input') as HTMLElement;
  const lines = [...text.getClientRects()].map(line => Math.round(line.top));
  const selection = area.ownerDocument.getSelection() as Selection;
  const caret = selection.getRangeAt(0).cloneRange();
  const node = caret.startContainer;
  if (!(node.nodeType === Node.TEXT_NODE && caret.startOffset < (node.textContent as string).length)) {
    return { lines, caret: null };
  }
  caret.setEnd(node, caret.startOffset + 1);
  return { lines, caret: Math.round(caret.getBoundingClientRect().top) };
}

/* Return on the on-screen keyboard at the end of the text left the caret behind the last character, and
   the new line appeared only with the next key, so a second Return looked necessary (#1011). A physical
   Enter does not show it: the browser itself adds what keeps the new line open. */
describe('Text area math element, Return on the on-screen keyboard (#1011)', () => {
  beforeEach('opens a player on a touch device and loads the unit', () => {
    cy.visit('http://localhost:4202/', {
      onBeforeLoad: win => {
        Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 2 });
      }
    });
    cy.loadUnit('text-area-math-keyboard-scroll.json');
    cy.get(AREA).click();
    cy.get('aspect-keyboard').should('be.visible');
    // The keyboard slides in and may scroll the field above itself once it is there
    cy.wait(500);
  });

  it('starts the new line at once and puts the caret on it', () => {
    pressKey('q');
    pressKey('w');
    pressKey('keyboard_return');
    waitForCaret();
    cy.get(AREA).should($area => {
      const { lines, caret } = measure($area[0]);
      expect(lines, 'line boxes of the text').to.have.length(2);
      expect(caret, 'top of the caret').to.be.closeTo(lines[1], 1);
    });
  });

  /* Passes without the fix as well: there the character itself opened the line. It holds the caret in front
     of the second line break, the one that keeps the line open -- behind it, "g" would start a third line. */
  it('writes the next character into the new line', () => {
    pressKey('q');
    pressKey('w');
    pressKey('keyboard_return');
    pressKey('g');
    waitForCaret();
    cy.get(AREA).should($area => {
      const text = $area[0].querySelector('.input') as HTMLElement;
      const lines = [...text.getClientRects()].map(line => Math.round(line.top));
      const range = $area[0].ownerDocument.createRange();
      const node = [...text.childNodes].find(child => child.textContent?.includes('g')) as Node;
      const offset = (node.textContent as string).indexOf('g');
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      expect(lines, 'line boxes of the text').to.have.length(2);
      expect(Math.round(range.getBoundingClientRect().top), 'top of the "g"').to.be.closeTo(lines[1], 1);
    });
  });
});
