import {
  addNewPage, clickButtonDialog, uploadFile, setDialogCheckbox
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addOptionViaFormField
} from './helpers/assistant-util';

describe('Checkbox assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Text Checkbox Group ──────────────────────────────────────────────
    it('creates a text checkbox group (Page 1)', () => {
      openAssistant('Kontrollkästchen');

      // Set Question
      typeInRichTextEditor('Was isst du gerne?');

      // Add options
      addOptionViaFormField('Apfel');
      addOptionViaFormField('Banane');
      addOptionViaFormField('Orange');

      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Image Checkbox Group ─────────────────────────────────────────────
    it('creates an image checkbox group (Page 2)', () => {
      addNewPage();
      openAssistant('Kontrollkästchen');

      // Set Question
      typeInRichTextEditor('Welche dieser Früchte magst du?');

      // Enable Image Options
      setDialogCheckbox('Bildoptionen verwenden');
      cy.wait(200);

      // Upload option image
      cy.stubFileInput();
      cy.contains('button', 'Bild hochladen').click();
      uploadFile('446878.jpeg');

      // image resize dialog pops up, click Speichern
      cy.get('mat-dialog-container').contains('button', 'Speichern').click();
      cy.wait(200);

      clickButtonDialog('Bestätigen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/checkbox_assistant.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/checkbox_assistant.json');
    });

    // ── Page 1: Text Checkbox Group ──────────────────────────────────────────────
    it('verifies the text checkbox group (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.contains('aspect-text', 'Was isst du gerne?').should('be.visible');
      cy.contains('aspect-checkbox:visible', 'Apfel').should('be.visible');
      cy.contains('aspect-checkbox:visible', 'Banane').should('be.visible');
      cy.contains('aspect-checkbox:visible', 'Orange').should('be.visible');
    });

    it('checks options in the text checkbox group (Page 1)', () => {
      cy.contains('aspect-checkbox:visible', 'Apfel')
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
      cy.contains('aspect-checkbox:visible', 'Apfel')
        .find('input')
        .click();
      cy.contains('aspect-checkbox:visible', 'Apfel')
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');

      cy.contains('aspect-checkbox:visible', 'Orange')
        .find('input')
        .click();
      cy.contains('aspect-checkbox:visible', 'Orange')
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');

      // Banane remains unchecked
      cy.contains('aspect-checkbox:visible', 'Banane')
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
    });

    // ── Page 2: Image Checkbox Group ─────────────────────────────────────────────
    it('verifies the image checkbox group (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.contains('aspect-text', 'Welche dieser Früchte magst du?').should('be.visible');
      cy.get('aspect-checkbox:visible').find('img[alt="Bildplatzhalter"]').should('be.visible');
    });

    it('checks option in the image checkbox group (Page 2)', () => {
      cy.get('aspect-checkbox:visible').first()
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
      cy.get('aspect-checkbox:visible').first()
        .find('input')
        .click();
      cy.get('aspect-checkbox:visible').first()
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');
    });
  });
});
