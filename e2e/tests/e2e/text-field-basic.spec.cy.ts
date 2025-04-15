import { addElement, addProperties } from '../util';
import { addMuster, addSettings } from './text-field-util';

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a numeric text field', () => {
      addElement('Eingabefeld');
      addProperties('Ziffern eingabe', { required: true });
      addSettings(4, 20, 'z.B. 1', { clearable: true });
      addMuster('1234567');
    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-field-basic.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-field-basic.json');
    });

    it('types an answer that is too short', () => {
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('mat-error').should('not.exist');
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('input')
        .clear()
        .type('123{enter}');
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('mat-error').should('exist');
    });

    it('types a wrong answer', () => {
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('input')
        .clear()
        .type('4444{enter}');
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('mat-error').should('exist');
    });

    it('types the correct answer', () => {
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('input')
        .clear()
        .type('1234567{enter}');
      cy.contains('mat-form-field', 'Ziffern eingabe')
        .find('mat-error').should('not.exist');
    });
  });
});
