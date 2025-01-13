import { addList, connectLists, dragTo, dragToByTouch } from './droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('creates droplists variants of connected lists and highlighting', () => {
      addList('Startliste', ['AAA', 'BBB', 'CCC'], { highlightReceivingDropList: true }, 'Startliste');
      addList('Verbunden', [], {}, 'Verbunden');
      addList('Nicht verbunden', [], {}, 'Nichtverbunden');

      connectLists('Startliste', 'Verbunden');
    });

    after('saves unit def', () => {
      cy.saveUnit('e2e/downloads/droplist-basic.json');
    });
  });

  context('player', () => {
    before('opens player and test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-basic.json');
    });

    it('drags to NOT connected list', () => {
      dragTo('Startliste', 'AAA', 'Nichtverbunden');
      cy.getByAlias('Nichtverbunden').children()
        .should('have.length', 0);
    });

    it('drags to connected list', () => {
      dragTo('Startliste', 'AAA', 'Verbunden');
      cy.getByAlias('Startliste').children()
        .should('have.length', 2);
      cy.getByAlias('Verbunden').children()
        .should('have.length', 1);
    });

    it('highlights lists', () => {
      cy.getByAlias('Startliste').find('.drop-list-item').first()
        .trigger('mousedown', { button: 0 });
      cy.getByAlias('Verbunden').should('have.class', 'isHighlighted');
      cy.getByAlias('Nichtverbunden').should('not.have.class', 'isHighlighted');
      cy.get('.drag-preview')
        .trigger('mouseup', { force: true });

      // second list has no highlighting activated
      cy.getByAlias('Verbunden').find('.drop-list-item').first()
        .trigger('mousedown', { button: 0 });
      cy.getByAlias('Startliste').should('not.have.class', 'isHighlighted');
      cy.getByAlias('Nichtverbunden').should('not.have.class', 'isHighlighted');
      cy.get('.drag-preview')
        .trigger('mouseup', { force: true });
    });

    it('works also by using touch events', () => {
      dragToByTouch('Startliste', 'BBB', 'Verbunden');
      cy.getByAlias('Startliste').children()
        .should('have.length', 1);
      cy.getByAlias('Verbunden').children()
        .should('have.length', 2);
    });
  });
});
