import {addDescriptionOptions} from "./options-util";

describe('Checkbox element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common checkbox', () => {
      addDescriptionOptions('Kontrollkästchen','Kontrollkästchen',{}, 'control1');
    });

    it('creates a readonly checkbox', () => {
      // TODO: Isn't this equal to a normal checkbox?
      addDescriptionOptions('Kontrollkästchen','Kontrollkästchen mit Schreibschutz',{readOnly:true}, 'control2');
    });

    it('creates a previously checked box', () => {
      addDescriptionOptions('Kontrollkästchen','vorgelegte Kontrollkästchen',{}, 'control3');
      cy.contains('mat-button-toggle','wahr').click();
    });

    it('creates a checkbox that is crossed out if selected', () => {
      addDescriptionOptions('Kontrollkästchen','Kontrollkästchen mit Auswahl durchstreichen',
        {crossOutChecked:true}, 'control4');
    });

    it('creates a required to check checkbox', () => {
      addDescriptionOptions('Kontrollkästchen','Kontrollkästchen mit Pflichtfeld',
        {required:true}, 'control5');
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
