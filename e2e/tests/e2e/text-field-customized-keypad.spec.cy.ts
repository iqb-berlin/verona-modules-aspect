import { addElement, addProperties } from '../util';
import { addHelp, addMuster, addSettings } from './text-field-util';

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text field with customized keypad', () => {
      addElement('Eingabefeld');
      addProperties('Eingabefeld mit eigene Zeichen', { required: true });
      addSettings(3, 20, '', { clearable: true, hasKeyboardIcon: true });
      addMuster('123');
      addHelp('Eigene Zeichen', 'rechts', undefined, '12345');
    });

    it('creates a text field with the same customized keypad disabling other characters', () => {
      addElement('Eingabefeld');
      addProperties('Eingabefeld mit Bearbeitung anderer Zeichen verhindern', { required: true });
      addSettings(3, 20, '', { clearable: true, hasKeyboardIcon: true });
      addMuster('123');
      addHelp('Eigene Zeichen', 'rechts', undefined, '12345', {disableOtherCharacters:true});
    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-field-customized-keypad.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-field-customized-keypad.json');
    });

    it('clicks at the first text field, and appears the keypad with customized characters', () => {
      cy.get('aspect-keypad').should('not.exist');
      cy.contains('mat-form-field', 'Eingabefeld mit eigene Zeichen').click();
      cy.get('aspect-keypad').contains('1').should('exist');
      cy.get('aspect-keypad').contains('7').should('not.exist');

    });

    it('types a wrong answer in the first text field', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit eigene Zeichen')
        .find('input')
        .clear()
        .type('6666{enter}');
      cy.contains('mat-form-field', 'Eingabefeld mit eigene Zeichen')
        .find('mat-error').should('exist');
    });

    it('types the correct answer in the first text field', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit eigene Zeichen')
        .find('input')
        .clear()
        .type('123{enter}');
      cy.contains('mat-form-field', 'Eingabefeld mit eigene Zeichen')
        .find('mat-error').should('not.exist');
    });

    it('types a wrong answer with allowed characters in the second text field', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit Bearbeitung anderer Zeichen verhindern')
        .find('input').click();
      cy.contains('mat-form-field', 'Eingabefeld mit eigene Zeichen')
        .find('input').click();

      cy.contains('mat-form-field', 'Eingabefeld mit Bearbeitung anderer Zeichen verhindern')
        .find('input')
        .clear()
        .type('5555{enter}');
      cy.contains('mat-form-field', 'Eingabefeld mit Bearbeitung anderer Zeichen verhindern')
        .find('mat-error').should('contain.text','Eingabe entspricht nicht der Vorgabe');
    });

    it('should not type non allowed characters in the second text field', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit Bearbeitung anderer Zeichen verhindern')
        .find('input')
        .clear()
        .type('7777{enter}');
      cy.contains('mat-form-field', 'Eingabefeld mit Bearbeitung anderer Zeichen verhindern')
        .find('mat-error').should('contain.text', 'Eingabe erforderlich');
    });
  });
});
