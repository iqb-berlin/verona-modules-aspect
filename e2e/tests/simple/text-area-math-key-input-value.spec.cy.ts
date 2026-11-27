import keyboardUnit from '../../fixtures/text-area-math-keyboard-scroll.json';

const KEYBOARD_AREA = '[data-element-id="text-area-math_keyboard"] .text-area';
const KEYPAD_AREA = '[data-element-id="text-area-math_keypad"] .text-area';

/** Presses a key of the player's on-screen keyboard or keypad, found by what its button shows. */
function pressKey(keys: string, label: string): void {
  cy.get(keys).last().find('button')
    .filter((_, button) => button.textContent?.trim() === label)
    .click({ scrollBehavior: false });
}

/** The text parts of a formula area as the player last reported them to the host, joined by `|`. */
function collectReportedText(id: string): { text: string | null } {
  const reported: { text: string | null } = { text: null };
  cy.window().then(win => {
    const collect = ({ source, data }: MessageEvent): void => {
      const elementCodes = data?.unitState?.dataParts?.elementCodes;
      if (source !== win || data?.type !== 'vopStateChangedNotification' || !elementCodes) return;
      const code = (JSON.parse(elementCodes) as { id: string; value: string }[]).find(entry => entry.id === id);
      if (!code) return;
      reported.text = (JSON.parse(code.value) as { type: string; value: string }[])
        .filter(segment => segment.type === 'text')
        .map(segment => segment.value)
        .join('|');
    };
    win.parent.addEventListener('message', collect);
    win.addEventListener('pagehide', () => win.parent.removeEventListener('message', collect));
  });
  return reported;
}

/* A key of the player sets the value of the formula area and has the text part report its text right after.
   The part still showed the text from before the key, and the answer lost the last key (#1710). Where the
   value equalled the one the part had rendered last -- after text typed on the device -- the part never
   showed it, and Backspace of the keypad seemed to do nothing. */
describe('Text area math element, keys of the player (#1710)', () => {
  it('reports the last key of the on-screen keyboard', () => {
    cy.visit('http://localhost:4202/', {
      onBeforeLoad: win => {
        Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 2 });
      }
    });
    const reported = collectReportedText('text-area-math_keyboard');
    cy.loadUnit('text-area-math-keyboard-scroll.json');
    cy.get(KEYBOARD_AREA).click();
    cy.get('aspect-keyboard').should('be.visible');

    pressKey('aspect-keyboard', 'a');
    pressKey('aspect-keyboard', 'b');
    pressKey('aspect-keyboard', 'c');

    cy.wrap(reported).its('text').should('equal', 'abc');
  });

  /* Backspace in front of the empty text part behind the formula removes the formula and focuses the merged
     part without a blur of the removed one. The keys were subscribed a second time then, and once the part
     showed a key's text at once, every key wrote its character twice. A key right after it, before the
     keyboard had opened again, went to the removed part and replaced the whole text. */
  it('writes a key once after Backspace has removed a formula', () => {
    cy.visit('http://localhost:4202/', {
      onBeforeLoad: win => {
        Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 2 });
      }
    });
    const reported = collectReportedText('text-area-math_keyboard');
    const segments = [{ type: 'text', value: 'x' }, { type: 'math', value: '1' }, { type: 'text', value: '' }];
    cy.sendStartCommand({
      unitDefinition: JSON.stringify(keyboardUnit),
      unitState: {
        dataParts: {
          elementCodes: JSON.stringify([
            { id: 'text-area-math_keyboard', status: 'VALUE_CHANGED', value: JSON.stringify(segments) }
          ])
        }
      }
    });
    cy.get(`${KEYBOARD_AREA} aspect-text-area-math-segment`).should('have.length', 3);
    // Beside the text: the caret goes into the empty last part, behind the formula
    cy.get(KEYBOARD_AREA).click('right');
    cy.get('aspect-keyboard').should('be.visible');

    pressKey('aspect-keyboard', 'keyboard_backspace');
    cy.get(`${KEYBOARD_AREA} aspect-text-area-math-segment`).should('have.length', 1);
    pressKey('aspect-keyboard', 'c');

    cy.get(`${KEYBOARD_AREA} .input`).should('have.text', 'xc');
    cy.wrap(reported).its('text').should('equal', 'xc');
  });

  it('shows and reports what Backspace of the keypad leaves after typing on the device', () => {
    cy.openPlayer();
    const reported = collectReportedText('text-area-math_keypad');
    cy.loadUnit('text-area-math-keypad.json');
    cy.get(KEYPAD_AREA).click();
    cy.get('aspect-keypad').should('exist');

    pressKey('aspect-keypad', 'a');
    pressKey('aspect-keypad', 'b');
    pressKey('aspect-keypad', 'c');
    cy.get(`${KEYPAD_AREA} .input`).type('d');
    pressKey('aspect-keypad', 'keyboard_backspace');

    cy.get(`${KEYPAD_AREA} .input`).should('have.text', 'abc');
    cy.wrap(reported).its('text').should('equal', 'abc');
  });
});
