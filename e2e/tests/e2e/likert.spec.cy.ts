import { addOptions, selectRadioButtonWithVerification } from './helpers/likert-util';
import { addElement, setPreferencesElement } from '../util';

describe('Likert element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates likert with text', () => {
      addElement('Optionentabelle');
      setPreferencesElement('Optionentabelle1', {});
      addOptions(['option A', 'option B'], ['row 1', 'row 2', 'row 3']);
      cy.contains('mat-form-field', 'Beschriftung (sekundär)')
        .find('textarea')
        .clear({ force: true })
        .type('Beschreibung sekundär von Optionentabelle1', { force: true });
    });

    it('edits a likert row via dialog', () => {
      cy.get('aspect-editor-dynamic-overlay').contains('Optionentabelle1').click({ force: true });
      cy.get('.option-draggable').contains('row 1')
        .closest('.option-draggable')
        .find('mat-icon').contains('build')
        .click();
      cy.get('aspect-likert-row-edit-dialog').should('exist');

      // Clear editor and type row label
      cy.get('aspect-likert-row-edit-dialog .ProseMirror').first()
        .clear()
        .type('Modified row 1');

      // Change ID/alias
      cy.get('aspect-likert-row-edit-dialog').contains('mat-form-field', 'ID').find('input').clear().type('modified_row_1');

      // Change Vorbelegung (preset) to option B (index 1)
      cy.get('aspect-likert-row-edit-dialog').contains('mat-form-field', 'Vorbelegung').click();
      cy.get('.cdk-overlay-container').contains('mat-option', 'option B').click();

      // Save changes
      cy.get('aspect-likert-row-edit-dialog').contains('button', 'Speichern').click();
      cy.get('aspect-likert-row-edit-dialog').should('not.exist');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/likert.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/likert.json');
    });

    it('verifies modified row label and preset', () => {
      // Row 1 text should be Modified row 1
      cy.get('aspect-likert').first().should('contain', 'Modified row 1');
      // Second option (index 1) should be checked by default
      cy.get('aspect-likert').first().find('mat-radio-button').eq(1).should('have.class', 'mat-mdc-radio-checked');
    });

    it('selects option for each row', () => {
      selectRadioButtonWithVerification('Optionentabelle1', 0);
      selectRadioButtonWithVerification('Optionentabelle1', 3);
      selectRadioButtonWithVerification('Optionentabelle1', 5);
    });

    it('changes the selection to option B for the first row', () => {
      selectRadioButtonWithVerification('Optionentabelle1', 1);
      // checks that radio button 0 is not checked
      cy.get('aspect-likert', { timeout: 10000 }).first()
        .find('mat-radio-button').eq(0)
        .should('not.have.class', 'mat-mdc-radio-checked');
    });
  });
});
