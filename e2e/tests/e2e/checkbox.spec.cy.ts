import {setCheckbox} from "../util";

describe('Checkbox', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common checkbox', () => {
      cy.contains('Kontrollkästchen').click();
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Kontrollkästchen');
    });

    it('creates a previously checked box', () => {
      cy.contains('Kontrollkästchen').click();
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('vorgelegte Kontrollkästchen');
      cy.contains('mat-button-toggle','wahr').click();
    });

    it('creates a checkbox that is crossed out if selected', () => {
      cy.contains('Kontrollkästchen').click();
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Kontrollkästchen mit Auswahl durchstreichen');
      setCheckbox('Auswahl durchstreichen');
    });

    it('creates a required to check checkbox', () => {
      cy.contains('Kontrollkästchen').click();
      cy.contains('mat-form-field', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Kontrollkästchen mit Pflichtfeld');
      setCheckbox('Pflichtfeld');
      cy.contains('mat-form-field', 'Warnmeldung')
        .find('input')
        .clear()
        .type('Dieses Kontrollkästchen muss angekreuzt werden');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/checkbox.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/checkbox.json');
    });

    it('checks the common box', () => {
      cy.contains('aspect-checkbox','Kontrollkästchen')
        .find('input')
        .click();
    });

    it('checks the box that does the strikethrough, and checks that the mat-checkbox has cross-out property', () => {
      cy.contains('aspect-checkbox','Kontrollkästchen mit Auswahl durchstreichen')
        .find('input')
        .click();
      cy.contains('aspect-checkbox','Kontrollkästchen mit Auswahl durchstreichen')
        .find('mat-checkbox')
        .should('have.class', 'cross-out');
    });

    it('checks the required box', () => {
      cy.contains('aspect-checkbox','Kontrollkästchen mit Pflichtfeld')
        .find('input')
        .click();
    });

    it('unchecks the required box, and checks that the warning is present', () => {
      cy.contains('aspect-checkbox','Kontrollkästchen mit Pflichtfeld')
        .find('input')
        .click();
      cy.contains('aspect-checkbox','Kontrollkästchen mit Pflichtfeld').click();
      cy.contains('aspect-checkbox','Kontrollkästchen mit Pflichtfeld')
        .find('mat-error')
        .contains('Dieses Kontrollkästchen muss angekreuzt werden');
    });
  });
});
