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

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/likert.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/likert.json');
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
