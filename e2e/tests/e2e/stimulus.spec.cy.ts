import {
  addElement,
  addNewPage, clickButtonDialog,
  clickTabAssistant,
  editText, selectRadioOption,
  submitDialog
} from '../util';

describe('Stimulus assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Text stimulus ─────────────────────────────────────────────────────
    it('creates a text stimulus with marking panel (Page 1)', () => {
      clickTabAssistant();
      addElement('Stimulus');
      cy.get('mat-dialog-container').contains('button', 'Text').click();
      cy.contains('mat-checkbox','Markieren zur Texterschließung erlauben').click();
      submitDialog();
    });

    it('creates a personalized text stimulus within two columns (Page 1)', () => {
      clickTabAssistant();
      addElement('Stimulus');
      cy.get('mat-dialog-container').contains('button', 'Text').click();

      editText("Meine Überschrift{enter}Mein Autor{enter}Mein Text{enter}Meine Fußnote");

      cy.get('aspect-editor-page-view').contains('Meine Überschrift').click({ force: true });
      cy.get('aspect-text-props')
        .contains('mat-form-field', 'Anzahl der Spalten')
        .find('input')
        .clear()
        .type('2{enter}');
    });

    // ── Page 2: Email stimulus ─────────────────────────────────────────────────────
    it('creates an email stimulus (Page 2)', () => {
      addNewPage();
      clickTabAssistant();
      addElement('Stimulus');
      cy.get('mat-dialog-container').contains('button', 'E-Mail').click();
      cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
    });

    it('creates an english email stimulus (Page 2)', () => {
      clickTabAssistant();
      addElement('Stimulus');
      cy.get('mat-dialog-container').contains('button', 'E-Mail').click();
      selectRadioOption('Englisch');
      cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
    });

    it('modifies the last Source (Page 2)', () => {
      cy.get('aspect-text:contains("Platzhalter Quelle")').eq(-1).click({force:true});
      cy.get('aspect-text-props').find('button:contains("edit")').click();

      cy.get('tiptap-editor').type(`{selectall}{backspace}Neue 2 Quelle`);
      clickButtonDialog('Speichern');

      cy.get('aspect-editor-page-view:contains("Neue 2 Quelle")').should('exist');
    });

    // ── Page 3: Message stimulus ─────────────────────────────────────────────────────
    it('creates a message stimulus (Page 3)', () => {
      addNewPage();
      clickTabAssistant();
      addElement('Stimulus');
      cy.get('mat-dialog-container').contains('button', 'Mobiltelefon').click();
      cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
    });

    it('creates a french message stimulus(Page 3)', () => {
      clickTabAssistant();
      addElement('Stimulus');
      cy.get('mat-dialog-container').contains('button', 'Mobiltelefon').click();
      selectRadioOption('Französisch');
      cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
    });

    it('modifies the last Source (Page 3)', () => {
      cy.get('aspect-text:contains("Platzhalter Quelle")').eq(-1).click({force:true});
      cy.get('aspect-text-props').find('button:contains("edit")').click();

      cy.get('tiptap-editor').type(`{selectall}{backspace}Neue 3 Quelle`);
      clickButtonDialog('Speichern');

      cy.get('aspect-editor-page-view:contains("Neue 3 Quelle")').should('exist');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/stimulus.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/stimulus.json');
    });

    // ── Page 1: Text stimulus ─────────────────────────────────────────────────────
    it('verifies the text stimulus (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.get('aspect-section').should('have.length', 2);
    });

    it('colours the word Überschrift of the text stimulus with marking panel (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.contains('aspect-text-group-element', 'Hier steht die Überschrift.').find('aspect-text-marking-button').eq(1).click();
      cy.contains('aspect-text-group-element', 'Hier steht die Überschrift.').contains('aspect-markable-word', 'die').click();
      cy.contains('aspect-text-group-element', 'Hier steht die Überschrift.').contains('aspect-markable-word', 'Überschrift').click();
    });

    it('verifies the personalized text stimulus (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.contains('Meine Überschrift').should('exist');
      cy.contains('Mein Autor').should('exist');
      cy.contains('Mein Text').should('exist');
      cy.contains('Meine Fußnote').should('exist');
      cy.contains('Meine Überschrift').parents('aspect-text').find('.text-container').should('have.css', 'column-count', '2');
    });

    // ── Page 2: Email stimulus ─────────────────────────────────────────────────────
    it('verifies the email stimulus (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.contains('Von:').should('exist');
      cy.contains('An:').should('exist');
      cy.contains('Betreff:').should('exist');
      cy.contains('Platzhalter Absender').should('exist');
      cy.contains('From:').should('exist');
      cy.contains('To:').should('exist');
      cy.contains('Subject:').should('exist');
    });

    // ── Page 3: Message stimulus ─────────────────────────────────────────────────────
    it('verifies the message stimulus (Page 3)', () => {
      cy.goToPlayerPage(3);
      cy.contains('Antworten').should('exist');
      cy.contains('Répondre').should('exist');
    });
  });
});
