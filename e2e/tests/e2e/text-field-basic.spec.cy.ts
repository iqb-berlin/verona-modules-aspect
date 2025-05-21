import { addElement, addProperties } from '../util';
import { addMuster, addSettings } from './text-field-util';

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a numeric text field', () => {
      addElement('Eingabefeld');
      addProperties('Geben Sie dem Geheimcode ein', { required: true });
      addSettings({minLength: 4, maxLength: 20, pattern: 'z.B. 1111'});
      addMuster('1234567');
    });

    it('creates a text field with clean option', ()=> {
      addElement('Eingabefeld');
      addProperties('Nennen Sie das Hobby');
      addSettings({minLength: 4, maxLength: 20, pattern: 'z.B. Schwimmen', settings: {clearable: true}});
      addMuster('Wanderung');
    });

    it('creates a text field with squared border and keyboard icon', ()=> {
      addElement('Eingabefeld');
      addProperties('Ausgefüllt Textfield mit Schreibeschutz', { readOnly: true });
      addSettings({appearance: 'Ausgefüllt'});
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
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('mat-error').should('not.exist');
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('input')
        .clear()
        .type('123{enter}');
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('mat-error').should('exist')
        .contains('Eingabe zu kurz; Eingabe entspricht nicht der Vorgabe');
    });

    it('types a wrong answer', () => {
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('input')
        .clear()
        .type('4444{enter}');
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('mat-error').should('exist')
        .contains('Eingabe entspricht nicht der Vorgabe');
    });

    it('types the correct answer', () => {
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('input')
        .clear()
        .type('1234567{enter}');
      cy.contains('mat-form-field', 'Geben Sie dem Geheimcode ein')
        .find('mat-error').should('not.exist');
    });

    it('checks the character text field has button clear and is not readonly', () => {
      cy.contains('mat-form-field', 'Nennen Sie das Hobby')
        .find('button:contains("close")')
        .click();
      cy.contains('mat-form-field', 'Nennen Sie das Hobby')
        .find('input')
        .should('not.have.attr','readonly');
      cy.contains('mat-form-field', 'Nennen Sie das Hobby')
        .find('input')
        .clear()
        .type('Wanderung');
    });

    it('checks that the squared text field is readonly', () => {
      cy.contains('mat-form-field', 'Ausgefüllt Textfield mit Schreibeschutz')
        .find('input')
        .should('have.attr','readonly');
    });
  });
});
