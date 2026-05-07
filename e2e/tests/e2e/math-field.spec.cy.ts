import {
  addElementHover, addNewPage, addNewSection, setPreferencesElement, setCheckbox
} from '../util';

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

    it('creates a math-field with a preset', () => {
      addElementHover('Formel', 'Feld');
      cy.get('aspect-preset-value-properties').contains('mat-label', 'Vorbelegung')
        .closest('aspect-preset-value-properties').find('math-field').shadow().find('.ML__content')
        .click()
        .type('abc');
      setPreferencesElement('Formel Feld mit Vorbelegung', { id: 'math-field-preset' });
    });

    it('creates a math-field with an union and overline formel preset', () => {
      const formula ="\\overline{S \\cup M}";
      addNewSection();
      addElementHover('Formel', 'Feld');
      setCheckbox('Eingabemodus änderbar');
      cy.get('aspect-element-properties').contains('mat-button-toggle', 'Formel')
        .click();
      cy.get('aspect-element-properties').contains('mat-label', 'Vorbelegung')
        .closest('aspect-preset-value-properties').find('math-field').shadow().find('.ML__content')
        .click()
        .type('\\overline{{}S\\cup M{}}{enter}');
      setPreferencesElement('Formel Feld mit Union Vorbelegung', { id: 'field-preset-union' });
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

    it('checks that the math-field has a preset value', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Vorbelegung').within(() => {
        cy.get('math-field').shadow().find('.ML__base').should('contain', 'a');
        cy.get('math-field').shadow().find('.ML__base').should('contain', 'b');
        cy.get('math-field').shadow().find('.ML__base').should('contain', 'c');
      });
    });

    it('checks that the math-field has an union and overline formel value', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Union Vorbelegung').within(() => {
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', 'o');
        cy.get('math-field').shadow().find('.ML__base').should('not.contain', 'v');
      });
    });
  });
});
