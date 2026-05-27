import {
  clickButtonDialog, addNewPage
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addOptionViaFormField
} from './helpers/assistant-util';

describe('Droplist assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a classic droplist (Zuordnung)', () => {
      openAssistant('Drag & Drop');
      cy.get('mat-dialog-container').contains('button', 'Zuordnung').click();

      // Frage/Instruktion
      typeInRichTextEditor('Ordnen Sie die Elemente zu!', 0);

      // Elementliste Überschrift
      typeInRichTextEditor('Startliste', 1);

      // Add Elementliste options
      addOptionViaFormField('Item A', 0);
      addOptionViaFormField('Item B', 0);

      // Ziel-Ablagen Überschrift
      typeInRichTextEditor('Zielliste', 2);

      // Add Ziel-Ablagen options
      addOptionViaFormField('Target X', 2);
      addOptionViaFormField('Target Y', 2);

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    it('creates a sort droplist (Sortieren)', () => {
      // Add a new page first
      addNewPage();
      cy.contains('Seite 2').should('exist');

      openAssistant('Drag & Drop');
      cy.get('mat-dialog-container').contains('button', 'Sortieren').click();

      // Frage/Instruktion
      typeInRichTextEditor('Sortieren Sie die Elemente!', 0);

      // Elementliste Überschrift
      typeInRichTextEditor('Unsortiert', 1);

      // Add Elementliste options
      addOptionViaFormField('First', 0);
      addOptionViaFormField('Second', 0);

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
