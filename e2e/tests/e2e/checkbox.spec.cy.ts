import { addElement, setPreferencesElement, setCheckbox } from '../util';

describe('Checkbox element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common checkbox', () => {
      addElement('Kontrollkästchen');
      setPreferencesElement('Kontrollkästchen', {});
    });

    it('creates a readonly checkbox', () => {
      addElement('Kontrollkästchen');
      setPreferencesElement('Kontrollkästchen mit Schreibschutz', { readOnly: true });
    });

    it('creates a default value true checkbox', () => {
      addElement('Kontrollkästchen');
      setPreferencesElement('vorbelegte Kontrollkästchen', {});
      cy.contains('mat-button-toggle', 'wahr').click();
    });

    it('creates a checkbox that is strikethrough if selected', () => {
      addElement('Kontrollkästchen');
      setPreferencesElement('Kontrollkästchen mit Auswahl durchstreichen', {});
      setCheckbox('Auswahl durchstreichen');
    });

    it('creates a required to check checkbox with a custom warning description', () => {
      addElement('Kontrollkästchen');
      setPreferencesElement('Kontrollkästchen mit Pflichtfeld', { required: true });
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
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
      cy.contains('aspect-checkbox', 'Kontrollkästchen')
        .find('input')
        .click();
      cy.contains('aspect-checkbox', 'Kontrollkästchen')
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');
    });

    it('checks that the readonly checkbox can not be checked', () => {
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Schreibschutz')
        .find('input')
        .click({force:true})
        .should('not.be.checked');
    });

    it('checks the box that does the strikethrough, and checks that the checkbox is strikethrough', () => {
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Auswahl durchstreichen')
        .find('input')
        .click();
      cy.wait(100);
      cy.contains('aspect-checkbox', 'Kontrollkästchen mit Auswahl durchstreichen')
        .find('mat-checkbox')
        .should('have.class', 'strike');
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
