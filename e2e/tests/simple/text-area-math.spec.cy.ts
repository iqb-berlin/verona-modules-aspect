import { addElementHover, setPreferencesElement } from '../util';

describe('Text area math element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });
    it('creates a common text-area-math', () => {
      addElementHover('Formel', 'Bereich');
      setPreferencesElement('Standard Formel Bereich', {});
    });

    it('creates a readonly text-area-math', () => {
      addElementHover('Formel', 'Bereich');
      setPreferencesElement('Formel Bereich mit Schreibschutz', { readOnly: true });
    });

    it('creates a required text-area-math ', () => {
      addElementHover('Formel', 'Bereich');
      setPreferencesElement('Formel Bereich mit Pflichtfeld', { required: true });
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-area-math.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-area-math.json');
    });

    it('checks the text-area-math is editable', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Bereich').within(() => {
        cy.get('button:contains("Formel einfügen")').click({ force: true });
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('1+x=2');
        cy.get('math-field').shadow().find('.ML__base').should('contain', '1');
        cy.get('math-field').shadow().find('.ML__base').should('contain', '+');
        cy.get('math-field').shadow().find('.ML__base').should('contain', '2');
      });
    });

    it('checks that the readonly text-area-math can not be edited', () => {
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Schreibschutz').within(() => {
        cy.get('button:contains("Formel einfügen")').click({ force: true });
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('x+y=4');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', 'x');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', '+');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', 'y');
      });
    });

    it('checks that the text-area-math does not show the error message', () => {
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Pflichtfeld').click();
      cy.clickOutside();
      cy.contains('aspect-element-group-selection',
                  'Formel Bereich mit Pflichtfeld').find('mat-error').should('exist');
    });

    it('checks that long unbroken text wraps inside the text area without horizontal overflow (#1076)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Bereich').within(() => {
        cy.get('.text-area').click();
        cy.focused().type('buchstabenketteohneleerzeichen'.repeat(4));
        cy.get('.text-area').should($area => {
          const viewportWidth = $area[0].ownerDocument.documentElement.clientWidth;
          expect($area[0].scrollWidth).to.be.at.most($area[0].clientWidth);
          expect($area[0].getBoundingClientRect().right).to.be.at.most(viewportWidth);
        });
      });
      cy.clickOutside();
    });

    it('checks that formula segments are capped at the area width and scroll internally (#1076)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Bereich').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('abcdefghijklmnopqrstuvwxyz'.repeat(3));
        cy.get('.text-area').then($area => {
          cy.get('math-field').should($mathField => {
            expect($mathField[0].getBoundingClientRect().width).to.be.at.most($area[0].clientWidth);
          });
        });
        cy.get('math-field').shadow().find('.ML__content').should($content => {
          expect($content[0].scrollWidth).to.be.greaterThan($content[0].clientWidth);
        });
      });
      cy.clickOutside();
    });

    it('shows the formula keyboard with empty boxes only and the reworked symbols (#1011)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Bereich').within(() => {
        cy.get('button:contains("Formel einfügen")').click({ force: true });
        cy.get('math-field').last().shadow().find('.ML__content').click()
          .type('3');
      });
      cy.get('.math-keyboard-container .MLK__layer.is-visible .MLK__keycap').should('have.length.greaterThan', 0);
      // mathlive draws #@ on a key as a filled blue square; no key on any tab may show one
      cy.get('.math-keyboard-container .ML__box-placeholder').should('not.exist');

      pressKeycapInserting('\\frac{#@}{#?}');
      cy.contains('aspect-element-group-selection', 'Standard Formel Bereich')
        .find('math-field').last()
        .should($mathField => {
          expect(($mathField[0] as unknown as { getValue(): string }).getValue()).to.contain('\\frac{3}');
        });

      cy.get('.math-keyboard-container .MLK__layer.is-visible [data-layer]').contains('≠')
        .trigger('pointerdown', { button: 0 });
      cy.get('.math-keyboard-container .MLK__layer.is-visible').within(() => {
        const added = ['≈', '∢', '%', '∧', '∨', '↦'];
        const removed = ['∃', '∄', '∀', '∁', '∑'];
        added.forEach(symbol => cy.get('.MLK__keycap').should('contain', symbol));
        removed.forEach(symbol => cy.get('.MLK__keycap').should('not.contain', symbol));
      });
      cy.clickOutside();
    });
  });
});

/** Presses the key of the visible keyboard layer whose keycap inserts `insert`, the way mathlive listens for it. */
function pressKeycapInserting(insert: string): void {
  cy.window().then(win => {
    const keyboard = (win as unknown as {
      mathVirtualKeyboard: { getKeycap(id: string): { insert?: string } | undefined }
    }).mathVirtualKeyboard;
    const keycaps = win.document.querySelectorAll<HTMLElement>(
      '.math-keyboard-container .MLK__layer.is-visible .MLK__keycap[id]'
    );
    const keycap = Array.from(keycaps).find(element => keyboard.getKeycap(element.id)?.insert === insert);
    expect(keycap, `keycap inserting ${insert}`).not.to.equal(undefined);
    cy.wrap(keycap as HTMLElement)
      .trigger('pointerdown', { button: 0 })
      .trigger('pointerup', { button: 0 });
  });
}
