import { addElement, uploadFile, clickButtonDialog } from '../util';

describe('Hotspot Edit Dialog', { testIsolation: false }, () => {
  before('opens an editor', () => {
    cy.openEditor();
  });

  it('adds a hotspot image element and opens the edit dialog', () => {
    cy.stubFileInput();

    // Add hotspot-image element ("Bildbereiche")
    addElement('Bildbereiche', 'Auswahl');

    uploadFile('446878.jpeg');
    clickButtonDialog('Speichern');

    // In properties panel, click the 'add' button for hotspots
    cy.get('aspect-hotspot-props').contains('mat-icon', 'add').click();

    // Click 'build' to open the edit dialog
    cy.get('aspect-hotspot-props').contains('mat-icon', 'build').click();
    
    // Verify dialog exists
    cy.get('aspect-hotspot-edit-dialog').should('exist');
  });

  it('modifies the hotspot properties', () => {
    // Change position and dimensions
    cy.contains('mat-form-field', 'Abstand von oben').find('input').clear().type('20');
    cy.contains('mat-form-field', 'Abstand von links').find('input').clear().type('30');
    cy.contains('mat-form-field', 'Bereichsbreite').find('input').clear().type('40');
    cy.contains('mat-form-field', 'Bereichshöhe').find('input').clear().type('50');

    // Change shape to 'Dreieck'
    cy.contains('mat-radio-button', 'Dreieck').find('input').click({ force: true });

    // Change rotation and borderWidth
    cy.contains('mat-form-field', 'Drehung').find('input').clear().type('45');
    cy.contains('mat-form-field', 'Rahmenbreite').find('input').clear().type('2');

    // Check checkboxes
    cy.contains('mat-checkbox', 'Aktivierter Bereich').find('input').click({ force: true });
    cy.contains('mat-checkbox', 'Schreibgeschützt').find('input').click({ force: true });

    // Save changes
    cy.get('mat-dialog-container').contains('button', 'Speichern').click();
    
    // Dialog should be closed
    cy.get('aspect-hotspot-edit-dialog').should('not.exist');
  });

  it('verifies the modifications in the UI/properties panel', () => {
    // Open dialog again to verify values were saved
    cy.get('aspect-hotspot-props').contains('mat-icon', 'build').click();
    
    cy.contains('mat-form-field', 'Abstand von oben').find('input').should('have.value', '20');
    cy.contains('mat-form-field', 'Abstand von links').find('input').should('have.value', '30');
    cy.contains('mat-form-field', 'Bereichsbreite').find('input').should('have.value', '40');
    cy.contains('mat-form-field', 'Bereichshöhe').find('input').should('have.value', '50');
    
    // The Dreieck radio button should be checked
    cy.contains('mat-radio-button', 'Dreieck').find('input').should('be.checked');
    
    cy.contains('mat-form-field', 'Drehung').find('input').should('have.value', '45');
    cy.contains('mat-form-field', 'Rahmenbreite').find('input').should('have.value', '2');
    
    // Checkboxes should be checked
    cy.contains('mat-checkbox', 'Aktivierter Bereich').find('input').should('be.checked');
    cy.contains('mat-checkbox', 'Schreibgeschützt').find('input').should('be.checked');
    
    // Close dialog
    cy.get('mat-dialog-container').contains('button', 'Abbrechen').click();
  });
});
