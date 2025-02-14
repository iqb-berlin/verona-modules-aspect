import { addElement, addProperties, setCheckbox } from '../util';

describe('Checkbox element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common checkbox', () => {
      addElement('Kontrollkästchen');
      addProperties('Kontrollkästchen', {});
    });

    it('creates a readonly checkbox', () => {
      addElement('Kontrollkästchen');
      addProperties('Kontrollkästchen mit Schreibschutz', { readOnly: true });
    });

    it('creates a previously checked box', () => {
      addElement('Kontrollkästchen');
      addProperties('vorgelegte Kontrollkästchen', {});
      cy.contains('mat-button-toggle', 'wahr').click();
    });

    it('creates a checkbox that is crossed out if selected', () => {
      addElement('Kontrollkästchen');
      addProperties('Kontrollkästchen mit Auswahl durchstreichen', {});
      setCheckbox('Auswahl durchstreichen');
    });

    it('creates a required to check checkbox', () => {
      addElement('Kontrollkästchen');
      addProperties('Kontrollkästchen mit Pflichtfeld', { required: true });
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
      cy.contains('aspect-checkbox', 'Kontrollkästchen')
        .find('input')
        .click();
    });

    it('checks the box that does the strikethrough, and checks that the mat-checkbox has cross-out property', () => {
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Auswahl durchstreichen')
        .find('input')
        .click();
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Auswahl durchstreichen')
        .find('mat-checkbox')
        .should('have.class', 'cross-out');
    });

    it('checks the required box', () => {
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Pflichtfeld')
        .find('input')
        .click();
    });

    it('unchecks the required box, and checks that the warning is present', () => {
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Pflichtfeld')
        .find('input')
        .click();
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Pflichtfeld').click();
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Pflichtfeld')
        .find('mat-error')
        .contains('Dieses Kontrollkästchen muss angekreuzt werden');
    });
  });
});
