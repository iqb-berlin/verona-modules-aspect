import {
  addNewPage, clickButtonDialog
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addGenericOption,
  addImageOptionInDialog
} from './helpers/assistant-util';

describe('MC assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Text MC and Text MC with Begründung ───────────────────────────────────
    it('creates a text MC (Page 1)', () => {
      openAssistant('MC');
      cy.get('mat-dialog-container').contains('button', 'Text').click();

      typeInRichTextEditor('Was ist die Antwort?');

      addGenericOption('Option A', 'Neue Option');
      addGenericOption('Option B', 'Neue Option');
      addGenericOption('Option C', 'Neue Option');

      clickButtonDialog('Bestätigen');
    });

    it('creates a text MC with reasoning (Page 1)', () => {
      openAssistant('MC');
      cy.get('mat-dialog-container').contains('button', 'Text').click();

      typeInRichTextEditor('Warum ist das so?');

      addGenericOption('Darum', 'Neue Option');
      addGenericOption('Deswegen', 'Neue Option');
      addGenericOption('Weil halt', 'Neue Option');

      cy.get('[mat-dialog-content]').scrollTo('bottom');
      cy.contains('mat-checkbox', 'Begründungsfeld anfügen').find('input').check({ force: true });
      cy.contains('mat-checkbox', 'Begründungsfeld anfügen').find('input').should('be.checked');

      typeInRichTextEditor('MEINE BEGRUENDUNG', 1);

      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Image MC and Image MC with Begründung ───────────────────────────────────
    it('creates an image MC (Page 2)', () => {
      addNewPage();
      openAssistant('MC');
      cy.get('mat-dialog-container').contains('button', 'Bilder').click();

      typeInRichTextEditor('Welches Bild passt?');

      addGenericOption('Bild A', 'Neue Option');
      addGenericOption('Bild B', 'Neue Option');
      addGenericOption('Bild C', 'Neue Option');

      cy.get('[mat-dialog-content]').scrollTo('bottom');
      cy.get('mat-dialog-container').contains('h3', 'Bilder je Zeile')
        .next('mat-form-field')
        .find('input')
        .clear()
        .type('2')
        .blur();

      clickButtonDialog('Bestätigen');
    });

    it('creates an image MC with reasoning (Page 2)', () => {
      openAssistant('MC');
      cy.get('mat-dialog-container').contains('button', 'Bilder').click();

      typeInRichTextEditor('Warum dieses Bild?');

      addGenericOption('Foto 1', 'Neue Option');
      addGenericOption('Foto 2', 'Neue Option');
      addGenericOption('Foto 3', 'Neue Option');

      cy.get('[mat-dialog-content]').scrollTo('bottom');
      cy.contains('mat-checkbox', 'Begründungsfeld anfügen').find('input').check({ force: true });
      cy.contains('mat-checkbox', 'Begründungsfeld anfügen').find('input').should('be.checked');

      typeInRichTextEditor('WARUM DIESES BILD', 1);

      cy.contains('mat-checkbox', 'Formeleingabefeld verwenden').find('input').check({ force: true });
      cy.contains('mat-checkbox', 'Formeleingabefeld verwenden').find('input').should('be.checked');

      clickButtonDialog('Bestätigen');
    });

    // ── Page 3: Image MC with uploaded option images ──────────────────────────────────
    it('creates an image MC with image options (Page 3)', () => {
      addNewPage();
      openAssistant('MC');
      cy.get('mat-dialog-container').contains('button', 'Bilder').click();

      typeInRichTextEditor('Welche Abbildung stimmt?');

      cy.stubFileInput();
      addImageOptionInDialog('Katze', 'test2.jpg');
      addImageOptionInDialog('Hund', '446878.jpeg');

      clickButtonDialog('Bestätigen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/assistant-mc.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/assistant-mc.json');
    });

    // ── Page 1: Text MC and Text MC with Begründung ───────────────────────────────────
    it('verifies the text MC (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.contains('Was ist die Antwort?').should('exist');
      cy.contains('Option A').should('exist');
      cy.contains('Option B').should('exist');
      cy.contains('Option C').should('exist');
    });

    it('selects option A from text MC (Page 1)', () => {
      cy.contains('mat-radio-button', 'Option A')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('mat-radio-button', 'Option A')
        .find('input').click({ multiple: true });
      cy.contains('mat-radio-button', 'Option A')
        .should('have.class', 'mat-mdc-radio-checked');
    });

    it('selects Deswegen from text MC with reasoning (Page 1)', () => {
      cy.contains('mat-radio-button', 'Deswegen')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('mat-radio-button', 'Deswegen')
        .find('input').click({ multiple: true });
      cy.contains('mat-radio-button', 'Deswegen')
        .should('have.class', 'mat-mdc-radio-checked');
    });

    it('verifies the text MC with reasoning (Page 1)', () => {
      cy.contains('Warum ist das so?').should('exist');
      cy.contains('Darum').should('exist');
      cy.contains('Deswegen').should('exist');
      cy.contains('MEINE BEGRUENDUNG').should('exist');
    });

    it('types a reason from text MC with reasoning (Page 1)', () => {
      cy.get('mat-form-field')
        .find('textarea')
        .type('Der Grund war ...');
    });

    // ── Page 2: Image MC and Image MC with Begründung ───────────────────────────────────
    it('verifies the image MC (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.contains('Welches Bild passt?').should('exist');
      cy.get('aspect-radio-group-images').should('have.length', 2);
      cy.contains('aspect-radio-group-images', 'Bild A').should('exist');
      cy.contains('aspect-radio-group-images', 'Bild B').should('exist');
      cy.contains('aspect-radio-group-images', 'Bild C').should('exist');
    });

    it('selects Bild A from image MC (Page 2)', () => {
      cy.contains('aspect-radio-group-images', 'Bild A')
        .contains('mat-radio-button', 'Bild A')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('aspect-radio-group-images', 'Bild A')
        .contains('mat-radio-button', 'Bild A')
        .find('input').click({ multiple: true });
      cy.contains('aspect-radio-group-images', 'Bild A')
        .contains('mat-radio-button', 'Bild A')
        .should('have.class', 'mat-mdc-radio-checked');
    });

    it('selects Foto 2 from image MC with reasoning (Page 2)', () => {
      cy.contains('aspect-radio-group-images', 'Foto 2')
        .contains('mat-radio-button', 'Foto 2')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('aspect-radio-group-images', 'Foto 2')
        .contains('mat-radio-button', 'Foto 2')
        .find('input').click({ multiple: true });
      cy.contains('aspect-radio-group-images', 'Foto 2')
        .contains('mat-radio-button', 'Foto 2')
        .should('have.class', 'mat-mdc-radio-checked');
    });

    it('verifies the image MC with reasoning (Page 2)', () => {
      cy.contains('Warum dieses Bild?').should('exist');
      cy.contains('Foto 1').should('exist');
      cy.contains('Foto 2').should('exist');
      cy.contains('WARUM DIESES BILD').should('exist');
      cy.get('aspect-text-area-math').should('exist');
    });

    it('types a formula from image MC with reasoning (Page 2)', () => {
      cy.get('aspect-text-area-math:visible').within(() => {
        cy.get('button:contains("Formel einfügen")').click({ force: true });
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('1+x=2');
      });
    });

    // ── Page 3: Image MC with uploaded option images ──────────────────────────────────
    it('verifies the image MC with image options (Page 3)', () => {
      cy.goToPlayerPage(3);
      cy.contains('Welche Abbildung stimmt?').should('exist');
      cy.contains('aspect-radio-group-images', 'Katze').should('exist');
      cy.contains('aspect-radio-group-images', 'Hund').should('exist');
      cy.get('aspect-radio-group-images:visible')
        .find('img[alt="Image Placeholder"]')
        .should('have.length', 2)
        .and('be.visible');
    });

    it('selects Katze from image MC with image options (Page 3)', () => {
      cy.contains('aspect-radio-group-images', 'Katze')
        .contains('mat-radio-button', 'Katze')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('aspect-radio-group-images', 'Katze')
        .contains('mat-radio-button', 'Katze')
        .find('input').click({ multiple: true });
      cy.contains('aspect-radio-group-images', 'Katze')
        .contains('mat-radio-button', 'Katze')
        .should('have.class', 'mat-mdc-radio-checked');
    });
  });
});
