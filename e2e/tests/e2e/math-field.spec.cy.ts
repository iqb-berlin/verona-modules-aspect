import {addElementHover, setPreferencesElement} from '../util';

describe('Math-field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });
    it('creates a common math-field', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Standard Formel Feld', {});
    });

    it('creates a readonly math-field', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Formel Feld mit Schreibschutz', { readOnly: true });
    });

    it('creates a required math-field ', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Formel Feld mit Pflichtfeld', { required: true });
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/math-field.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/math-field.json');
    });

    it('checks the common math-field is editable ', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click().type('1+x=2');
        cy.get('math-field').shadow().find('.ML__base').should('contain', '1');
        cy.get('math-field').shadow().find('.ML__base').should('contain', '+');
        cy.get('math-field').shadow().find('.ML__base').should('contain', '2');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', '7');
      });
    });

    it('checks that the readonly math-field can not be edited', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Schreibschutz').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click().type('x+y=4');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', 'x');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', '+');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', 'y');
      });
    });

    it('checks that the required math-field shows the error message if it is not fill in', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Pflichtfeld').click();
      cy.clickOutside();
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Pflichtfeld')
        .find('mat-error').should('exist');
    });
  });
});
