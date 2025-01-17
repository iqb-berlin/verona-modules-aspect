import { addList } from './droplist-util';
import { clickElement } from "../util";

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates one droplist', () => {
      addList('Startliste', ['AAA'], {}, 'Startliste');

    });

    it('duplicates the droplist', () => {
      clickElement('Element duplizieren');
      cy.getByAlias('drop-list_1').children()
        .should('have.length', 1);
    });

    it('eliminates the droplist', () => {
      clickElement('Element löschen');
      clickElement('Bestätigen');
      cy.getByAlias('drop-list_1').should('not.exist');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-general.json');
    });
  });

  context('player', () => {
    before('opens a player', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-general.json');
    });
  });
});
