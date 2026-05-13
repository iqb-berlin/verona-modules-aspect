import {
  clickButtonDialog, clickTabAssistant
} from '../util';
import { selectRadioButtonWithVerification } from './helpers/likert-util';
import {addGenericOption} from "./helpers/assistant-util";

describe('MCM assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a Multiple Choice Matrix (Page 1)', () => {
      clickTabAssistant();
      cy.contains('button', 'CMC').click();

      // Set Question
      cy.get('mat-dialog-container').find('aspect-rich-text-editor').first()
        .find('.ProseMirror')
        .click().type(`{selectall}{backspace}MCM Question Content`);

      // Set Sentence Beginning
      cy.contains('h3', 'Satzanfang').next('mat-form-field').find('textarea').type('Start of sentence{enter}');

      // Add Options (Columns)
      addGenericOption('Col A','Neue Option');
      addGenericOption('Col B','Neue Option');
      // Add Rows
      addGenericOption('Row 1','Neue Zeile');
      addGenericOption('Row 2','Neue Zeile');

      clickButtonDialog('Bestätigen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/mcm.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/mcm.json');
    });

    it('verifies the MCM rendering (Page 1)', () => {
      cy.contains('MCM Question Content').should('exist');
      cy.contains('Start of sentence').should('exist');
      cy.contains('Col A').should('exist');
      cy.contains('Col B').should('exist');
      cy.contains('Row 1').should('exist');
      cy.contains('Row 2').should('exist');
    });

    it('selects radio buttons in the matrix (Page 1)', () => {
      // Row 1, Col A (index 0)
      selectRadioButtonWithVerification('Row 1', 0);
      // Row 1, Col B (index 1)
      selectRadioButtonWithVerification('Row 1', 1);
      // Row 2, Col B (index 3 because it's the 4th radio button: Row1-A, Row1-B, Row2-A, Row2-B)
      selectRadioButtonWithVerification('Row 2', 3);
    });
  });
});
