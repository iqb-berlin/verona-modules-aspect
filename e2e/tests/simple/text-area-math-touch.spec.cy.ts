import { addElementHover, setPreferencesElement } from '../util';

/**
 * Puts a finger on the middle of the subject and lifts it after the given time, as the browser's own
 * touch -- only a real touch makes the browser send the compatibility mouse events after it, and only
 * a finger that rests lifts after the player has set the caret (#1218). Synthetic events from
 * `trigger()` are not followed by compatibility events at all.
 * Chromium only (the DevTools protocol), which is what the pipeline runs: Electron.
 */
function holdTouch(subject: JQuery<HTMLElement>, milliseconds: number): void {
  const rect = subject[0].getBoundingClientRect();
  const autFrame = window.top?.document.querySelector<HTMLIFrameElement>('.aut-iframe');
  if (!autFrame?.contentWindow) throw new Error('The frame Cypress runs the player in was not found');
  const frameRect = autFrame.getBoundingClientRect();
  // Cypress scales the application frame down to fit its runner
  const scale = frameRect.width / autFrame.contentWindow.innerWidth;
  const x = frameRect.left + (rect.left + rect.width / 2) * scale;
  const y = frameRect.top + (rect.top + rect.height / 2) * scale;
  const touch = (type: 'touchStart' | 'touchEnd') => Cypress.automation('remote:debugger:protocol', {
    command: 'Input.dispatchTouchEvent',
    params: { type, touchPoints: type === 'touchStart' ? [{ x, y }] : [] }
  });
  // One command for the whole touch: a cy.wait() between two commands held the finger for seconds
  cy.then(() => touch('touchStart')
    .then(() => Cypress.Promise.delay(milliseconds))
    .then(() => touch('touchEnd')));
}

/* A finger that rests on the formula area beside the text: the player puts the caret into the
   segment while the finger is down, and the browser sends its compatibility mousedown only when the
   finger lifts. That mousedown used to take the focus away again, so the on-screen keyboard opened
   and closed at once (#1218). Both tests fail without the fix, in Electron 37 and in Chrome 151. */
describe('Text area math element, touched (#1218)', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text-area-math with the on-screen keyboard', () => {
      addElementHover('Formel', 'Bereich');
      // The on-screen keyboard is on by default for a formula area, and stays so here
      cy.contains('aspect-merged-checkbox', 'Tastatur einblenden').find('input[type="checkbox"]')
        .should('be.checked');
      setPreferencesElement('Formel Bereich mit Tastatur', {});
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-area-math-touch.json');
    });
  });

  context('player', () => {
    before('opens a player on a touch device and loads the saved unit', () => {
      cy.visit('http://localhost:4202/', {
        onBeforeLoad: win => {
          Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 2 });
        }
      });
      cy.loadUnit('../downloads/text-area-math-touch.json');
    });

    it('keeps the keyboard open after a finger rested beside the text', () => {
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Tastatur')
        .find('.text-area')
        .then($area => holdTouch($area, 150));
      // The keyboard used to be gone again within a few milliseconds, and stayed gone
      cy.wait(500);
      cy.get('aspect-keyboard').should('exist');
      cy.focused().should('have.class', 'input');
    });

    it('keeps it open on a second touch of the same area', () => {
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Tastatur')
        .find('.text-area')
        .then($area => holdTouch($area, 150));
      cy.wait(500);
      cy.get('aspect-keyboard').should('exist');
      cy.focused().should('have.class', 'input');
    });
  });
});
