import {addLikert} from "./options-util";

describe('Radio element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates radio list with text', () => {
      addLikert('Optionentabelle', ['option A', 'option B'],['row 1', 'row 2', 'row 3'], 'Optionentabelle1');
    });

    it('modifies the alignment of the first option to the 8th column', () => {
      cy.contains('mat-form-field', 'Anteil der ersten Spalte')
        .find('input')
        .clear()
        .clear()
        .type('8');
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

    it('selects options for each rows', () => {
      cy.contains('aspect-likert','Optionentabelle1')
        .find('mat-radio-button').eq(0).click();
      cy.contains('aspect-likert','Optionentabelle1')
        .find('mat-radio-button').eq(3).click();
      cy.contains('aspect-likert','Optionentabelle1')
        .find('mat-radio-button').eq(5).click();
    });

    it('changes the selection to option B for the first row', () => {
      cy.contains('aspect-likert','Optionentabelle1')
        .find('mat-radio-button').eq(1).click();
    });
  });
});
