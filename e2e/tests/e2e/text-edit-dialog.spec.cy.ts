import { addElement, clickButtonDialog } from '../util';

describe('Text edit dialog', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
      cy.contains('Text').should('be.visible');
    });

    it('saves an edited button label', () => {
      addElement('Knopf', 'Sonstige');
      cy.get('aspect-button').last().dblclick({ force: true });

      cy.get('aspect-text-edit-dialog').should('exist');
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container input').should('have.value', 'Knopf');
      cy.get('mat-dialog-container input').clear().type('Neuer Knopftext');
      clickButtonDialog('Speichern');

      cy.contains('aspect-button', 'Neuer Knopftext').should('exist');
    });

    it('discards edits on cancel', () => {
      cy.get('aspect-button').last().dblclick({ force: true });

      cy.get('aspect-text-edit-dialog').should('exist');
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container input').clear().type('Sollte nicht gespeichert werden');
      clickButtonDialog('Abbrechen');

      cy.contains('aspect-button', 'Neuer Knopftext').should('exist');
      cy.contains('aspect-button', 'Sollte nicht gespeichert werden').should('not.exist');
    });
  });
});
