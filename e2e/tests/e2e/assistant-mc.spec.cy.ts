import {
  addNewPage, clickButtonDialog, clickTabAssistant,
  submitDialog
} from '../util';
import {addMCOption} from "./helpers/assistant-util";

describe('MC assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Text MC and Text MC with Begründung ───────────────────────────────────
    it('creates a text MC (Page 1)', () => {
      clickTabAssistant();
      cy.contains('button', 'MC').click();
      cy.get('mat-dialog-container').contains('button', 'Text').click();

      cy.get('mat-dialog-container').find('.input1 .ProseMirror').first()
        .click().type(`{selectall}{backspace}Was ist die Antwort?`);

      addMCOption('Option A');
      addMCOption('Option B');
      addMCOption('Option C');

      clickButtonDialog('Bestätigen');
    });

    it('creates a text MC with reasoning (Page 1)', () => {
      clickTabAssistant();
      cy.contains('button', 'MC').click();
      cy.get('mat-dialog-container').contains('button', 'Text').click();

      cy.get('mat-dialog-container').find('.input1 .ProseMirror').first()
        .click().type(`{selectall}{backspace}Warum ist das so?`);

      addMCOption('Darum');
      addMCOption('Deswegen');
      addMCOption('Weil halt');

      cy.get('[mat-dialog-content]').scrollTo('bottom');
      cy.contains('mat-checkbox', 'Begründungsfeld anfügen').find('input').check({ force: true });
      cy.contains('mat-checkbox', 'Begründungsfeld anfügen').find('input').should('be.checked');

      cy.get('aspect-rich-text-editor').eq(1).click().type('{selectall}{backspace}MEINE BEGRUENDUNG');

      clickButtonDialog('Bestätigen');
      cy.wait(100);
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
