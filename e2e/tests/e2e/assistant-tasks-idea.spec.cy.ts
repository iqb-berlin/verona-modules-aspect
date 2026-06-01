import {
  clickButtonDialog
} from '../util';
import {
  openAssistant, typeInRichTextEditor
} from './helpers/assistant-util';

describe('Aufgabenidee assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a tasks idea setup', () => {
      // 1. Open Assistant
      openAssistant('Aufgabenidee');

      // 2. Type values into all 5 rich-text editors
      typeInRichTextEditor('Detaillierte Beschreibung der Aufgabenidee', 0);
      typeInRichTextEditor('Skizzen-Details', 1);
      typeInRichTextEditor('Loesungsweg', 2);
      typeInRichTextEditor('Vorlage-Link', 3);
      typeInRichTextEditor('Ressourcen-Link', 4);

      // 3. Click Confirm
      clickButtonDialog('Bestätigen');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/assistant_tasks_idea.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the saved unit definition', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/assistant_tasks_idea.json');
    });

    it('verifies the tasks idea elements are rendered correctly', () => {
      // Verify main red header (bold and red)
      cy.get('aspect-text:visible').contains('Aufgabenvorschlag fürs IQB')
        .should('be.visible')
        .and('have.css', 'color', 'rgb(255, 0, 0)');

      // Verify all section labels and contents
      cy.get('aspect-text:visible').should('contain', 'Beschreibung der Aufgabenidee:');
      cy.get('aspect-text:visible').should('contain', 'Detaillierte Beschreibung der Aufgabenidee');

      cy.get('aspect-text:visible').should('contain', 'Skizze der Aufgabe:');
      cy.get('aspect-text:visible').should('contain', 'Skizzen-Details');

      cy.get('aspect-text:visible').should('contain', 'Lösung der Aufgabe:');
      cy.get('aspect-text:visible').should('contain', 'Loesungsweg');

      cy.get('aspect-text:visible').should('contain', 'Aufgabenvorlage:');
      cy.get('aspect-text:visible').should('contain', 'Vorlage-Link');

      cy.get('aspect-text:visible').should('contain', 'Benötigte Ressourcen:');
      cy.get('aspect-text:visible').should('contain', 'Ressourcen-Link');
    });
  });
});
