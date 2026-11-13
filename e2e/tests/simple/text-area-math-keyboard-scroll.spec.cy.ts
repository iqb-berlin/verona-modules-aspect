const AREA = '[data-element-id="text-area-math_keyboard"] .text-area';

/** Presses a key of the player's on-screen keyboard, found by what its button shows. */
function pressKey(label: string): void {
  cy.get('aspect-keyboard button')
    .filter((_, button) => button.textContent?.trim() === label)
    .click({ scrollBehavior: false });
}

/** Two frames: the player sets the caret of an editable text, and scrolls to it, in the next one. */
function waitForCaret(): void {
  cy.window().then(win => new Cypress.Promise<void>(resolve => {
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
  }));
}

/* Typing on the on-screen keyboard into a formula area aligned the caret to the bottom of every scroll area
   around it after each key. At the first key that pulled the page back from where the keyboard had put the
   field, and it left the lower part of the caret's line beyond the edge (#1661). Both tests fail without the
   fix in Electron 37. */
describe('Text area math element, typed on the on-screen keyboard (#1661)', { testIsolation: false }, () => {
  before('opens a player on a touch device and loads the unit', () => {
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

  it('leaves the page where it is when the caret is in sight', () => {
    cy.get('aspect-page-scroll-button').then($page => {
      const scrollTop = $page[0].scrollTop;
      pressKey('q');
      waitForCaret();
      cy.get(AREA).should('contain.text', 'q');
      cy.get('aspect-page-scroll-button').its('0.scrollTop').should('eq', scrollTop);
    });
  });

  it('shows the whole line of the caret once the text runs past the bottom of the area', () => {
    Cypress._.times(4, () => {
      pressKey('keyboard_return');
      pressKey('g');
    });
    waitForCaret();
    cy.get('aspect-page-scroll-button').then($page => {
      const pageBottom = $page[0].getBoundingClientRect().bottom;
      cy.get(AREA).should($area => {
        const area = $area[0];
        expect(area.scrollHeight, 'the text runs past the area').to.be.greaterThan(area.clientHeight);
        const lines = area.querySelector('.input')?.getClientRects() as DOMRectList;
        const lastLine = lines[lines.length - 1].bottom;
        const areaBottom = area.getBoundingClientRect().top + area.clientTop + area.clientHeight;
        expect(lastLine, 'bottom of the last line against the area').to.be.at.most(areaBottom + 0.5);
        expect(lastLine, 'bottom of the last line against the keyboard').to.be.at.most(pageBottom + 0.5);
      });
    });
  });
});
