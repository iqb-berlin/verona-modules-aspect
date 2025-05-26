import { addElement, addProperties } from '../util';
import {addPattern, addSettings, textFieldRegexValidation} from './text-field-util';

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text field that accepts only the characters 1234567', () => {
      addElement('Eingabefeld');
      addProperties('Geben Sie dem Geheimcode ein', { required: true });
      addSettings({minLength: 4, maxLength: 20, defaultText: 'z.B. 1111'});
      addPattern('1234567');
    });

    it('creates a text field with clear option', ()=> {
      addElement('Eingabefeld');
      addProperties('Nennen Sie das Hobby');
      addSettings({minLength: 4, maxLength: 20, defaultText: 'z.B. Schwimmen', settings: {clearable: true}});
      addPattern('Wanderung');
    });

    it('creates a text field with squared border and keyboard icon', ()=> {
      addElement('Eingabefeld');
      addProperties('Ausgefüllt Textfield mit Schreibeschutz', { readOnly: true });
      addSettings({settings: {hasKeyboardIcon:true},appearance: 'Ausgefüllt'});
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

    it('checks the valid regex of the first text field', () => {
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('mat-error').should('not.exist');
      // Case 1: answer too short
      textFieldRegexValidation('Geben Sie dem Geheimcode ein',
        '123',
        'Eingabe zu kurz; Eingabe entspricht nicht der Vorgabe')
      // case 2: wrong answer
      textFieldRegexValidation('Geben Sie dem Geheimcode ein',
        '4444',
        'Eingabe entspricht nicht der Vorgabe')
      // case 3: correct answer
      textFieldRegexValidation('Geben Sie dem Geheimcode ein',
        '1234567')
    });

    it('checks the second text field has button clear', () => {
      cy.contains('mat-form-field', 'Nennen Sie das Hobby')
        .find('button:contains("close")')
        .click();
    });

    it('checks that the second text field is not readonly', () => {
      cy.contains('mat-form-field', 'Nennen Sie das Hobby')
        .find('input')
        .should('not.have.attr','readonly');
      textFieldRegexValidation('Nennen Sie das Hobby',
        'Wanderung')
    });

    it('checks that the squared text field is readonly', () => {
      cy.contains('mat-form-field', 'Ausgefüllt Textfield mit Schreibeschutz')
        .find('input')
        .should('have.attr','readonly');
    });
  });
});
