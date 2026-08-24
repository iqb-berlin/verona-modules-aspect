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
  });
});
