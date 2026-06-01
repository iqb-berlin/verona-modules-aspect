import {
  clickButtonDialog
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addGenericOption
} from "./helpers/assistant-util";

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

      addGenericOption('Option A','Neue Option');
      addGenericOption('Option B','Neue Option');
      addGenericOption('Option C','Neue Option');

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


    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/mc.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/mc.json');
    });

    // ── Page 1: Text MC and Text MC with Begründung ───────────────────────────────────
    it('verifies the text MC (Page 1)', () => {
      cy.contains('Was ist die Antwort?').should('exist');
      cy.contains('Option A').should('exist');
      cy.contains('Option B').should('exist');
      cy.contains('Option C').should('exist');
    });

    it('selects option A from text MC (Page 1)', () => {
      cy.contains('mat-radio-button', 'Option A')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('mat-radio-button', 'Option A')
        .find('input').click({ multiple: true});
      cy.contains('mat-radio-button', 'Option A')
        .should('have.class', 'mat-mdc-radio-checked');
    });

    it('selects Deswegen from text MC with reasoning (Page 1)', () => {
      cy.contains('mat-radio-button', 'Deswegen')
        .should('not.have.class', 'mat-mdc-radio-checked');
      cy.contains('mat-radio-button', 'Deswegen')
        .find('input').click({ multiple: true});
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
  });
});
