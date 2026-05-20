import {
  clickButtonDialog, clickTabAssistant, addNewPage
} from '../util';

describe('Droplist assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a classic droplist (Zuordnung)', () => {
      clickTabAssistant();
      cy.contains('button', 'Drag & Drop').click();
      cy.get('mat-dialog-container').contains('button', 'Zuordnung').click();

      // Frage/Instruktion
      cy.get('mat-dialog-container')
        .find('aspect-rich-text-editor').eq(0)
        .find('.ProseMirror')
        .click().type('{selectall}{backspace}Ordnen Sie die Elemente zu!');

      // Elementliste Überschrift
      cy.get('mat-dialog-container')
        .find('aspect-rich-text-editor').eq(1)
        .find('.ProseMirror')
        .click().type('{selectall}{backspace}Startliste');

      // Add Elementliste options
      cy.get('mat-dialog-container').find('mat-form-field').eq(0).find('textarea')
        .click({force: true}).type('Item A{enter}');
      cy.get('mat-dialog-container').find('mat-form-field').eq(0).find('textarea')
        .click({force: true}).type('Item B{enter}');

      // Ziel-Ablagen Überschrift
      cy.get('mat-dialog-container')
        .find('aspect-rich-text-editor').eq(2)
        .find('.ProseMirror')
        .click().type('{selectall}{backspace}Zielliste');

      // Add Ziel-Ablagen options
      cy.get('mat-dialog-container').find('mat-form-field').eq(2).find('textarea')
        .click({force: true}).type('Target X{enter}');
      cy.get('mat-dialog-container').find('mat-form-field').eq(2).find('textarea')
        .click({force: true}).type('Target Y{enter}');

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    it('creates a sort droplist (Sortieren)', () => {
      // Add a new page first
      addNewPage();
      cy.contains('Seite 2').should('exist');

      clickTabAssistant();
      cy.contains('button', 'Drag & Drop').click();
      cy.get('mat-dialog-container').contains('button', 'Sortieren').click();

      // Frage/Instruktion
      cy.get('mat-dialog-container')
        .find('aspect-rich-text-editor').eq(0)
        .find('.ProseMirror')
        .click().type('{selectall}{backspace}Sortieren Sie die Elemente!');

      // Elementliste Überschrift
      cy.get('mat-dialog-container')
        .find('aspect-rich-text-editor').eq(1)
        .find('.ProseMirror')
        .click().type('{selectall}{backspace}Unsortiert');

      // Add Elementliste options
      cy.get('mat-dialog-container').find('mat-form-field').eq(0).find('textarea')
        .click({force: true}).type('First{enter}');
      cy.get('mat-dialog-container').find('mat-form-field').eq(0).find('textarea')
        .click({force: true}).type('Second{enter}');

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist.json');
    });

    it('verifies the classic droplist (Page 1)', () => {
      cy.contains('Ordnen Sie die Elemente zu!').should('exist');
      cy.contains('Startliste').should('exist');
      cy.contains('Item A').should('exist');
      cy.contains('Item B').should('exist');
      
      cy.contains('Zielliste').should('exist');
      cy.contains('Target X').should('exist');
      cy.contains('Target Y').should('exist');
    });

    it('verifies the sort droplist (Page 2)', () => {
      cy.goToPlayerPage(2);

      cy.contains('Sortieren Sie die Elemente!').should('exist');
      cy.contains('First').should('exist');
      cy.contains('Second').should('exist');
    });
  });
});
