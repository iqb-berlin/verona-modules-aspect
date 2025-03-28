import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates several droplists, and the second  is a read only list', () => {
      addList('Startliste', ['AAA'], { copyElement: true }, 'Startliste');
      addList('Zielliste mit Schreibschutz', [], { readOnly: true }, 'ZiellisteSchutz');
      addList('Zielliste ohne Schreibschutz', [], {}, 'Zielliste');

      connectLists('Startliste', 'ZiellisteSchutz');
      connectLists('Startliste', 'Zielliste');
      connectLists('ZiellisteSchutz', 'Startliste');
      connectLists('Zielliste', 'Startliste');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-readonly.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-readonly.json');
    });

    it('drags to read only list', () => {
      dragTo('Startliste', 'AAA', 'ZiellisteSchutz');
      cy.getByAlias('ZiellisteSchutz').children()
        .should('have.length', 0);
      // Handle the exception for function dragTo, with no pointer-events:none
      Cypress.on('fail', error => {
        if (!error.message.includes('pointer-events: none')) {
          throw error;
        }
      });
    });

    it('drags to non read only list', () => {
      dragTo('Startliste', 'AAA', 'Zielliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 1);
      dragTo('Zielliste', 'AAA', 'Startliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 0);
    });
  });
});
