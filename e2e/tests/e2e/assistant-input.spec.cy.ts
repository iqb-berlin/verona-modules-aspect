import {
  addNewPage, clickButtonDialog, setDialogCheckbox
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor
} from "./helpers/assistant-util";

describe('Input assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Basic Input ──────────────────────────────────────────────────────
    it('creates a basic input section (Page 1)', () => {
      openAssistant('Antwortfeld(er)');

      // Set Question
      typeInRichTextEditor('Was ist 1 + 1?');

      clickButtonDialog('Bestätigen');
    });

    // ── Page 1: Multiple Inputs with numbering ───────────────────────────────────
    it('creates a section with multiple input fields and numbering (Page 1)', () => {
      openAssistant('Antwortfeld(er)');

      // Set Question
      typeInRichTextEditor('Nenne drei Primzahlen.');

      cy.get('mat-dialog-container').contains('h3', 'Anzahl Antwortfelder')
        .next('mat-form-field').find('input').clear().type('3');

      cy.get('mat-dialog-container').contains('h3', 'Nummerierung')
        .next('mat-form-field').find('mat-select').click();
      cy.get('.cdk-overlay-container').contains('mat-option', '1), 2), ...').click();
      cy.get('body').click(0, 0);

      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Multiline Input ──────────────────────────────────────────────────
    it('creates a section with a multiline input (Page 2)', () => {
      addNewPage();
      openAssistant('Antwortfeld(er)');

      // Set Question
      typeInRichTextEditor('Beschreibe den Wasserkreislauf.');

      cy.contains('mat-radio-button', 'Mehrzeilig').click();

      cy.get('mat-dialog-container').contains('mat-label', 'Erwartete Zeichenanzahl')
        .parents('mat-form-field').find('input').clear().type('200');

      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Math Input ───────────────────────────────────────────────────────
    it('creates a section with math input fields (Page 2)', () => {
      openAssistant('Antwortfeld(er)');

      // Set Question
      typeInRichTextEditor('Löse die Gleichung.');

      setDialogCheckbox('Formeleingabefelder verwenden');

      clickButtonDialog('Bestätigen');
      cy.get('aspect-element-properties').contains('mat-label', 'Vorbelegung')
        .closest('aspect-preset-value-properties').find('math-field').shadow().find('.ML__content')
        .click()
        .type('\\overline{{}S\\cup M{}}=X+1{enter}');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/input.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/input.json');
    });

    // ── Page 1: Basic Input ──────────────────────────────────────────────────────
    it('verifies the basic input section (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.contains('aspect-text', 'Was ist 1 + 1?').should('be.visible');
      cy.get('aspect-text-field:visible').should('exist');
    });

    it('types into the basic input field (Page 1)', () => {
      cy.get('aspect-text-field:visible').first().find('input').type('2');
    });

    // ── Page 1: Multiple Inputs ──────────────────────────────────────────────────
    it('verifies the multiple input fields (Page 1)', () => {
      cy.contains('aspect-text', 'Nenne drei Primzahlen.').should('be.visible');
      cy.contains('aspect-text', '1)').should('be.visible');
      cy.contains('aspect-text', '2)').should('be.visible');
      cy.contains('aspect-text', '3)').should('be.visible');
    });

    // ── Page 2: Multiline Input ──────────────────────────────────────────────────
    it('verifies the multiline input field (Page 3)', () => {
      cy.goToPlayerPage(2);
      cy.contains('aspect-text', 'Beschreibe den Wasserkreislauf.').should('be.visible');
      cy.get('aspect-text-area:visible').should('exist');
    });

    it('types into the multiline input field (Page 3)', () => {
      cy.get('aspect-text-area:visible').find('textarea').type('Wasser verdunstet, kondensiert und regnet ab.');
    });

    // ── Page 4: Math Input ───────────────────────────────────────────────────────
    it('verifies the math input field (Page 4)', () => {
      cy.contains('aspect-text', 'Löse die Gleichung.').should('be.visible');
      cy.get('aspect-math-field:visible').should('exist');
    });
  });
});
