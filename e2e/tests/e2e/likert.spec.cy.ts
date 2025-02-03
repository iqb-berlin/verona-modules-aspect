import {addLikert} from "./options-util";

describe('Radio element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.viewport(1600,900);
      cy.openEditor();
    });

    it('creates radio list with text', () => {
      addLikert('Optionentabelle', ['option A', 'option B'],['row 1', 'row 2', 'row 3'], 'Optionentabelle1');
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
  });
});
