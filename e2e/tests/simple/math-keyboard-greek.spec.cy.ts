import { addElementHover, setPreferencesElement } from '../util';

const VISIBLE_LAYER = '.math-keyboard-container .MLK__layer.is-visible';

describe('Greek layout of the formula keyboard', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a math-field with the default keyboard layouts, which include the Greek one', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Formel Feld Griechisch', {});
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/math-keyboard-greek.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/math-keyboard-greek.json');
    });

    afterEach('closes the keyboard, also after a failed test, so the next one starts on the first layer', () => {
      cy.clickOutside();
    });

    it('names the psi key psi and shows only the capital letter in its shift hint (#1644)', () => {
      openGreekLayer();
      keycapInserting('\\psi').then($keycap => {
        cy.wrap($keycap).children('aside').should('have.text', 'psi');
        cy.wrap($keycap).find('.MLK__shift').should('contain', 'Ψ');
        cy.wrap($keycap).find('.MLK__shift .greek-capital-name').should('not.be.visible');
      });
      cy.get(`${VISIBLE_LAYER} .greek-capital-name:visible`).should('have.length', 0);
    });

    it('shows the names of the capital letters while shift is pressed and inserts the capital (#1644)', () => {
      openGreekLayer();
      cy.get(`${VISIBLE_LAYER} .shift`).first().trigger('pointerdown', { button: 0 });
      cy.get(`${VISIBLE_LAYER} .greek-capital-name:visible`).should('have.length', 26);
      keycapInserting('\\psi').then($keycap => {
        cy.wrap($keycap).should('contain', 'Ψ');
        cy.wrap($keycap).find('.greek-capital-name').should('be.visible').and('have.text', 'Psi');
        cy.wrap($keycap)
          .trigger('pointerdown', { button: 0 })
          .trigger('pointerup', { button: 0 });
      });
      cy.contains('aspect-element-group-selection', 'Formel Feld Griechisch')
        .find('math-field')
        .should($mathField => {
          expect(($mathField[0] as unknown as { getValue(): string }).getValue()).to.contain('\\Psi');
        });
    });
  });
});

/** Focuses the math field and switches the formula keyboard to the Greek layer. */
function openGreekLayer(): void {
  cy.contains('aspect-element-group-selection', 'Formel Feld Griechisch').within(() => {
    cy.get('math-field').shadow().find('.ML__content').click();
  });
  cy.get(`${VISIBLE_LAYER} [data-layer]`).contains('αβγ')
    .trigger('pointerdown', { button: 0 });
  cy.get(`${VISIBLE_LAYER} .MLK__keycap`).should('contain', 'ψ');
}

/**
 * The key of the visible keyboard layer whose keycap inserts `insert` (without shift). Found through
 * mathlive's keycap definitions, because the rendered key carries only a generated id.
 */
function keycapInserting(insert: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.window().then(win => {
    const keyboard = (win as unknown as {
      mathVirtualKeyboard: { getKeycap(id: string): { insert?: string } | undefined }
    }).mathVirtualKeyboard;
    const keycaps = win.document.querySelectorAll<HTMLElement>(`${VISIBLE_LAYER} .MLK__keycap[id]`);
    const keycap = Array.from(keycaps).find(element => keyboard.getKeycap(element.id)?.insert === insert);
    expect(keycap, `keycap inserting ${insert}`).not.to.equal(undefined);
    return Cypress.$(keycap as HTMLElement);
  });
}
