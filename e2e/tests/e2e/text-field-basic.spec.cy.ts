import { addElement, setPreferencesElement } from '../util';
import { setRegexPattern, setPreferences, validateTextField } from './text-field-util';

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.viewport(1600, 900);
      cy.openEditor();
    });

    it('creates a readonly text field', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Eingabefeld mit Schreibschutz', { readOnly: true });
    });

    it('creates a required text field', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Pflichtfeld Eingabefeld', { required: true });
    });

    it('creates a text field with a minimum length of 3 characters', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Eingabefeld mit einer Minimallänge von 3 Zeichen');
      setPreferences({ minLength: 3 });
    });

    it('creates a text field with a maximum length of 10 characters', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Eingabefeld mit einer Maximallänge von 10 Zeichen');
      setPreferences({ maxLength: 10, settings: { isLimitedToMaxLength: true } });
    });

    it('creates a text field with clear option', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Eingabefeld mit Löschtaste');
      setPreferences({ settings: { clearable: true } });
    });

    it('creates a text field that accepts only the pattern 1[a-z]000', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Eingabefeld mit 1[a-z]000 Muster');
      setRegexPattern('1[a-z]000');
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

    it('checks that the first text field is readonly ', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit Schreibschutz')
        .find('input')
        .should('have.attr', 'readonly');
    });

    it('checks the required text field', () => {
      cy.contains('mat-form-field', 'Pflichtfeld Eingabefeld').click();
      cy.clickOutside();
      cy.contains('mat-form-field', 'Pflichtfeld Eingabefeld')
        .find('mat-error').should('exist')
        .contains('Eingabe erforderlich');
    });

    it('checks that the minimal length Warning is present', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit einer Minimallänge von 3 Zeichen')
        .find('mat-error').should('not.exist');
      validateTextField('Eingabefeld mit einer Minimallänge von 3 Zeichen',
                          '12',
                          'Eingabe zu kurz');
    });

    it('checks that the maximal length Warning ist present', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit einer Maximallänge von 10 Zeichen')
        .find('mat-error').should('not.exist');
      validateTextField('Eingabefeld mit einer Maximallänge von 10 Zeichen',
                          '12345678910',
                          'Eingabe zu lang');
    });

    it('checks the regex of the text field', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit 1[a-z]000 Muster')
        .find('mat-error').should('not.exist');
      validateTextField('Eingabefeld mit 1[a-z]000 Muster',
                          '6000',
                          'Eingabe entspricht nicht der Vorgabe');
      validateTextField('Eingabefeld mit 1[a-z]000 Muster',
                          '1a000');
    });

    it('checks the text field that has a clear button', () => {
      cy.contains('mat-form-field', 'Eingabefeld mit Löschtaste')
        .find('button:contains("close")').should('exist');
    });
  });
});
