import { addOptions } from './likert-util';
import {
  addElement, addProperties, selectFromDropdown, setCheckbox
} from '../util';

describe('Radio button group element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several radio button groups with no preselected option', () => {
      cy.contains('Optionsfelder').trigger('mouseover');
      addElement('mit Text');
      addProperties('Vertikal ausgerichtete Optionsfelder');
      addOptions(['AA', 'BB']);

      cy.contains('Optionsfelder').trigger('mouseover');
      addElement('mit Text');
      addProperties('Horizontal ausgerichtete Optionsfelder');
      addOptions(['CC', 'DD']);
      selectFromDropdown('Ausrichtung', 'horizontal');

      cy.contains('Optionsfelder').trigger('mouseover');
      addElement('mit Text');
      addProperties('Optionsfelder mit Nicht gewählte Optionen durchstreichen');
      addOptions(['EE', 'FF', 'GG']);
      setCheckbox('Nicht gewählte Optionen durchstreichen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/radio.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/radio.json');
    });

    it('checks the two radio button groups', () => {
      cy.contains('.radio-button-label', 'AA').click();
      cy.get('mat-radio-button.mat-mdc-radio-checked')
        .contains('.radio-button-label', 'BB')
        .should('not.exist');

      cy.contains('.radio-button-label', 'DD').click();
      cy.get('mat-radio-button.mat-mdc-radio-checked')
        .contains('.radio-button-label', 'DD')
        .should('exist');
    });

    it('checks radio button in the third group, and checks that other options are crossed out ', () => {
      cy.contains('.radio-button-label', 'EE').click();
      cy.get('mat-radio-button.strike')
        .contains('.radio-button-label', 'FF')
        .should('exist');
      cy.get('mat-radio-button.strike')
        .contains('.radio-button-label', 'GG')
        .should('exist');
    });
  });
});
