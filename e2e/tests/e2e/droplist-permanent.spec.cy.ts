import { addList, connectLists, dragTo } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates one droplist with permanent, and normal placeholder', () => {
      addList('Platzhalterliste mit Durchschrift' , ['AAA', 'BBB'], {permanentPlaceholders: true}, 'PlatzhalterlisteCC');
      addList('Platzhalterliste', ['CCC', 'DDD'], {permanentPlaceholders: true, permanentPlaceholdersCC: true}, 'Platzhalterliste');
      addList('Standardliste', ['EEE', 'FFF'], {}, 'Standardliste');
      addList('Zielliste', [], {}, 'Zielliste');

      connectLists('PlatzhalterlisteCC', 'Zielliste');
      connectLists('Zielliste', 'PlatzhalterlisteCC');
      connectLists('Platzhalterliste', 'Zielliste');
      connectLists('Zielliste', 'Platzhalterliste');
      connectLists('Standardliste', 'Zielliste');
      connectLists('Zielliste', 'Standardliste');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist-permanent.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-permanent.json');
    });

    it('drags from watermark permanent placeholder to goal list, and drags it back', () => {
      dragTo('PlatzhalterlisteCC', 'AAA', 'Zielliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 1);
      cy.getByAlias('PlatzhalterlisteCC').children()
        .should('have.length', 2);

      dragTo('Zielliste', 'AAA', 'PlatzhalterlisteCC');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 0);
      cy.getByAlias('PlatzhalterlisteCC').children()
        .should('have.length', 2);
    });

    it('drags from permanent placeholder to goal list, and drags it back', () => {
      dragTo('Platzhalterliste', 'CCC', 'Zielliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 1);
      cy.getByAlias('Platzhalterliste').children()
        .should('have.length', 2);

      dragTo('Zielliste', 'CCC', 'Platzhalterliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 0);
      cy.getByAlias('Platzhalterliste').children()
        .should('have.length', 2);
    });

    it('drags from common list to goal list, and drags it back', () => {
      dragTo('Standardliste', 'EEE', 'Zielliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 1);
      cy.getByAlias('Standardliste').children()
        .should('have.length', 1);

      dragTo('Zielliste', 'EEE', 'Standardliste');
      cy.getByAlias('Zielliste').children()
        .should('have.length', 0);
      cy.getByAlias('Standardliste').children()
        .should('have.length', 2);
    });
  });
});
